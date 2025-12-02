# backend/app/routes/games.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import secrets

from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user
from app.schemas import GameOut
from app.core.email import email_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/games",
    tags=["games"],
    redirect_slashes=False,
)


@router.post(
    "",
    response_model=schemas.GameOut,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um novo jogo",
)
def criar_jogo(
    game_in: schemas.GameCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Gerar link único para visualização pública
    public_link = secrets.token_urlsafe(32)
    
    # Garantir que o link é único
    while db.query(models.Game).filter(models.Game.public_link == public_link).first():
        public_link = secrets.token_urlsafe(32)
    
    novo = models.Game(
        opponent=game_in.opponent,
        date=game_in.date,
        location=game_in.location,
        categoria=game_in.category,
        status="PENDENTE",
        owner_id=current_user.id,
        public_link=public_link
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)

    # Adiciona os jogadores selecionados
    if game_in.players:
        for player_id in game_in.players:
            player = db.query(models.Player).filter(models.Player.id == player_id).first()
            if player:
                novo.players.append(player)
        db.commit()
        db.refresh(novo)

    return schemas.GameOut.model_validate(novo)


@router.get(
    "",
    response_model=List[schemas.GameOut],
    summary="Lista todos os jogos",
)
def listar_jogos(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Se for team_admin, mostrar jogos dos jogadores vinculados + seus próprios jogos
    # Se for player, mostrar apenas jogos onde ele participou
    # Se for superadmin, mostrar todos os jogos
    if current_user.role == "team_admin":
        # Buscar IDs dos jogadores vinculados ao time
        team_player_ids = [p.id for p in db.query(models.Player).filter(
            models.Player.team_id == current_user.id
        ).all()]
        
        # Buscar jogos onde o usuário é owner OU onde há jogadores do time
        from sqlalchemy import or_
        query = db.query(models.Game).filter(
            or_(
                models.Game.owner_id == current_user.id,
                models.Game.players.any(models.Player.id.in_(team_player_ids))
            )
        )
    elif current_user.role == "player":
        # Player vê apenas jogos onde ele participou
        player = db.query(models.Player).filter(
            models.Player.user_id == current_user.id
        ).first()
        if player:
            query = db.query(models.Game).filter(
                models.Game.players.contains(player)
            )
        else:
            query = db.query(models.Game).filter(models.Game.id == -1)  # Nenhum jogo
    elif current_user.role == "superadmin":
        # Superadmin vê todos os jogos
        query = db.query(models.Game)
    else:
        # Outros roles veem apenas seus próprios jogos
        query = db.query(models.Game).filter(models.Game.owner_id == current_user.id)
    
    if status:
        query = query.filter(models.Game.status == status)
    if data_inicio:
        query = query.filter(models.Game.date >= data_inicio)
    if data_fim:
        query = query.filter(models.Game.date <= data_fim)
    
    games = query.offset(skip).limit(limit).all()
    return [schemas.GameOut.model_validate(game) for game in games]


@router.get(
    "/{game_id}",
    response_model=schemas.GameOut,
    summary="Consulta um jogo por ID",
)
def ler_jogo(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jogo = db.query(models.Game).options(joinedload(models.Game.players)).filter(
        models.Game.id == game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return schemas.GameOut.model_validate(jogo)


@router.put(
    "/{game_id}",
    response_model=schemas.GameOut,
    summary="Atualiza um jogo",
)
def atualizar_jogo(
    game_id: int,
    game_in: schemas.GameUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jogo = db.query(models.Game).options(joinedload(models.Game.players)).filter(
        models.Game.id == game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")

    data = game_in.model_dump(exclude_unset=True)
    old_status = jogo.status
    
    for field, value in data.items():
        if field != "players":
            setattr(jogo, field, value)

    # Atualizar jogadores associados
    if "players" in data and data["players"] is not None:
        # Pega a lista de IDs de jogadores já associados
        current_player_ids = {p.id for p in jogo.players}
        
        for player_id in data["players"]:
            # Adiciona apenas se o jogador não estiver associado
            if player_id not in current_player_ids:
                player = db.query(models.Player).filter(models.Player.id == player_id).first()
                if player:
                    jogo.players.append(player)

    db.commit()
    db.refresh(jogo)
    
    # Se a partida foi finalizada, enviar emails para os jogadores
    if old_status != "FINALIZADA" and jogo.status == "FINALIZADA":
        try:
            # Buscar todos os jogadores da partida que têm usuário associado
            for player in jogo.players:
                if player.user_id:
                    user = db.query(models.User).filter(models.User.id == player.user_id).first()
                    if user and user.email:
                        game_date = jogo.date.strftime("%d/%m/%Y") if jogo.date else "Data não informada"
                        email_service.send_game_finished_email(
                            email=user.email,
                            name=user.name,
                            game_opponent=jogo.opponent,
                            game_date=game_date,
                            game_id=jogo.id
                        )
            logger.info(f"Emails de partida finalizada enviados para jogadores do jogo {jogo.id}")
        except Exception as e:
            logger.error(f"Erro ao enviar emails de partida finalizada: {e}")
            # Não falha a atualização se o email não for enviado
    
    return schemas.GameOut.model_validate(jogo)


@router.delete(
    "/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um jogo",
)
def remover_jogo(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jogo = db.query(models.Game).filter(
        models.Game.id == game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    db.delete(jogo)
    db.commit()
    return None


@router.get(
    "/public/{game_id}",
    response_model=schemas.GameOut,
    summary="Consulta um jogo público por ID",
)
def ler_jogo_publico(
    game_id: int,
    db: Session = Depends(get_db),
):
    jogo = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return jogo

@router.get(
    "/public/link/{public_link}",
    response_model=schemas.GameOut,
    summary="Consulta um jogo público por link único",
)
def ler_jogo_por_link(
    public_link: str,
    db: Session = Depends(get_db),
):
    jogo = db.query(models.Game).options(
        joinedload(models.Game.players)
    ).filter(models.Game.public_link == public_link).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return schemas.GameOut.model_validate(jogo)

@router.put(
    "/{game_id}/scoreboard",
    response_model=schemas.GameOut,
    summary="Atualiza o estado do placar",
)
def atualizar_placar(
    game_id: int,
    scoreboard_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jogo = db.query(models.Game).filter(
        models.Game.id == game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    if "away_score" in scoreboard_data:
        jogo.away_score = scoreboard_data.get("away_score", 0)
    if "timer_time" in scoreboard_data:
        jogo.timer_time = scoreboard_data.get("timer_time", 720)
    if "timer_running" in scoreboard_data:
        jogo.timer_running = scoreboard_data.get("timer_running", False)
    if "current_quarter" in scoreboard_data:
        jogo.current_quarter = scoreboard_data.get("current_quarter", 1)
    
    db.commit()
    db.refresh(jogo)
    return schemas.GameOut.model_validate(jogo)

@router.get(
    "/public/link/{public_link}/scoreboard",
    summary="Busca apenas o estado do placar (para visualização pública)",
)
def buscar_placar_publico(
    public_link: str,
    db: Session = Depends(get_db),
):
    jogo = db.query(models.Game).filter(
        models.Game.public_link == public_link
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    # Calcular pontuação casa a partir das estatísticas
    from sqlalchemy import func
    from app.models import Statistic
    
    home_score_result = db.query(
        func.sum(Statistic.two_made * 2 + Statistic.three_made * 3 + Statistic.free_throw_made)
    ).filter(Statistic.game_id == jogo.id).scalar()
    
    home_score = home_score_result or 0
    
    return {
        "home_score": home_score,
        "away_score": jogo.away_score or 0,
        "timer_time": jogo.timer_time or 720,
        "timer_running": jogo.timer_running or False,
        "current_quarter": jogo.current_quarter or 1,
        "opponent": jogo.opponent
    }
