# backend/app/routes/games.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user
from app.schemas import GameOut

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
    data = game_in.dict()
    novo = models.Game(
        opponent=data['opponent'],
        date=data['date'],
        location=data.get('location'),
        categoria=data.get('categoria'),
        status="PENDENTE",
        owner_id=current_user.id
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)

    # Adiciona os jogadores selecionados
    if data.get('players'):
        for player_id in data['players']:
            player = db.query(models.Player).filter(models.Player.id == player_id).first()
            if player:
                novo.players.append(player)
        db.commit()
        db.refresh(novo)

    return schemas.GameOut.from_orm(novo)


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
    query = db.query(models.Game).filter(models.Game.owner_id == current_user.id)
    
    if status:
        query = query.filter(models.Game.status == status)
    if data_inicio:
        query = query.filter(models.Game.date >= data_inicio)
    if data_fim:
        query = query.filter(models.Game.date <= data_fim)
    
    return query.offset(skip).limit(limit).all()


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
    return {
        "id": jogo.id,
        "opponent": jogo.opponent,
        "date": jogo.date,
        "location": jogo.location,
        "status": jogo.status,
        "created_at": jogo.created_at,
        "players": [schemas.PlayerOut.from_orm(p) for p in jogo.players],
    }


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

    data = game_in.dict(exclude_unset=True)
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
    return {
        "id": jogo.id,
        "opponent": jogo.opponent,
        "date": jogo.date,
        "location": jogo.location,
        "status": jogo.status,
        "created_at": jogo.created_at,
        "players": [schemas.PlayerOut.from_orm(p) for p in jogo.players],
    }


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
