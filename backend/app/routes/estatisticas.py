from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/estatisticas",
    tags=["statistics"],
    redirect_slashes=False,
)

@router.post(
    "",
    response_model=schemas.StatisticOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new statistic",
)
def create_statistic(
    statistic_in: schemas.StatisticCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verifica se o jogo existe e pertence ao usuário
    game = db.query(models.Game).filter(
        models.Game.id == statistic_in.game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Verifica se a jogadora existe
    player = db.query(models.Player).filter(
        models.Player.id == statistic_in.player_id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Verifica se já existe estatística para essa jogadora, jogo e quarto
    existing_stat = db.query(models.Statistic).filter(
        models.Statistic.game_id == statistic_in.game_id,
        models.Statistic.player_id == statistic_in.player_id,
        models.Statistic.quarter == statistic_in.quarter
    ).first()
    
    if existing_stat:
        # Atualiza a estatística existente
        for field, value in statistic_in.dict().items():
            setattr(existing_stat, field, value)
        db.commit()
        db.refresh(existing_stat)
        return existing_stat
    
    # Cria nova estatística
    new_stat = models.Statistic(**statistic_in.dict())
    db.add(new_stat)
    db.commit()
    db.refresh(new_stat)
    return new_stat

@router.get(
    "/game/{game_id}",
    response_model=List[schemas.StatisticOut],
    summary="List statistics of a game",
)
def list_game_statistics(
    game_id: int,
    quarter: Optional[int] = None,
    player_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verifica se o jogo existe e pertence ao usuário
    game = db.query(models.Game).filter(
        models.Game.id == game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    query = db.query(models.Statistic).filter(
        models.Statistic.game_id == game_id
    )
    
    if quarter:
        query = query.filter(models.Statistic.quarter == quarter)
    if player_id:
        query = query.filter(models.Statistic.player_id == player_id)
    
    return query.all()

@router.get(
    "/game/{game_id}/summary",
    response_model=schemas.StatisticsSummary,
    summary="Return summary of game statistics",
)
def game_statistics_summary(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verifica se o jogo existe e pertence ao usuário
    game = db.query(models.Game).filter(
        models.Game.id == game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Busca todas as estatísticas do jogo
    statistics = db.query(models.Statistic).filter(
        models.Statistic.game_id == game_id
    ).all()
    
    # Calcula totais gerais
    totals = {
        "total_points": sum(e.points for e in statistics),
        "total_assists": sum(e.assists for e in statistics),
        "total_rebounds": sum(e.rebounds for e in statistics),
        # Add other fields as needed
    }
    
    # Calcula totais por quarto
    por_quarto = {}
    for quarto in range(1, 5):  # 1 a 4 quartos
        stats_quarto = [e for e in statistics if e.quarter == quarto]
        por_quarto[quarto] = {
            "quarto": quarto,
            "total_points": sum(e.points for e in stats_quarto),
            "total_assists": sum(e.assists for e in stats_quarto),
            "total_rebounds": sum(e.rebounds for e in stats_quarto),
        }
    
    return {
        **totals,
        "por_quarto": list(por_quarto.values())
    }

@router.put(
    "/{statistic_id}",
    response_model=schemas.StatisticOut,
    summary="Update a statistic",
)
def update_statistic(
    statistic_id: int,
    statistic_in: schemas.StatisticUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    statistic = db.query(models.Statistic).join(
        models.Game
    ).filter(
        models.Statistic.id == statistic_id,
        models.Game.owner_id == current_user.id
    ).first()
    
    if not statistic:
        raise HTTPException(status_code=404, detail="Statistic not found")
    
    for field, value in statistic_in.dict(exclude_unset=True).items():
        setattr(statistic, field, value)
    
    db.commit()
    db.refresh(statistic)
    return statistic

@router.delete(
    "/{statistic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a statistic",
)
def delete_statistic(
    statistic_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    statistic = db.query(models.Statistic).join(
        models.Game
    ).filter(
        models.Statistic.id == statistic_id,
        models.Game.owner_id == current_user.id
    ).first()
    
    if not statistic:
        raise HTTPException(status_code=404, detail="Statistic not found")
    
    db.delete(statistic)
    db.commit()
    return None

@router.get(
    "/public/game/{game_id}",
    response_model=List[schemas.StatisticOut],
    summary="Lista estatísticas públicas de um jogo",
)
def listar_estatisticas_publicas(
    game_id: int,
    quarter: Optional[int] = None,
    player_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    game = db.query(models.Game).filter(
        models.Game.id == game_id
    ).first()
    if not game:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    query = db.query(models.Statistic).filter(
        models.Statistic.game_id == game_id
    )
    
    if quarter:
        query = query.filter(models.Statistic.quarter == quarter)
    if player_id:
        query = query.filter(models.Statistic.player_id == player_id)
    
    return query.all()

@router.get(
    "/games/{game_id}/stats",
    response_model=List[schemas.StatisticOut],
    summary="Lista estatísticas de um jogo (compatível com frontend)",
)
def listar_stats_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verifica se o jogo existe e pertence ao usuário
    game = db.query(models.Game).filter(
        models.Game.id == game_id,
        models.Game.owner_id == current_user.id
    ).first()
    if not game:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return db.query(models.Statistic).filter(models.Statistic.game_id == game_id).all()

# Alias: GET /stats/games/{game_id} (retorna estatísticas do jogo)
@router.get(
    "/stats/games/{game_id}",
    response_model=List[schemas.StatisticOut],
    summary="Alias em inglês para listar estatísticas de um jogo",
)
def stats_game_english(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return listar_stats_game(game_id, db, current_user)

# Alias: POST /stats/games/{game_id} (cria estatística para o jogo)
@router.post(
    "/stats/games/{game_id}",
    response_model=schemas.StatisticOut,
    status_code=status.HTTP_201_CREATED,
    summary="Alias em inglês para criar estatística de um jogo",
)
def create_stats_game_english(
    game_id: int,
    statistic_in: schemas.StatisticCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Garante que o game_id do path é usado
    statistic_in.game_id = game_id
    return create_statistic(statistic_in, db, current_user)

# Alias: GET /stats/games/{game_id}/players (retorna estatísticas dos jogadores do jogo)
@router.get(
    "/stats/games/{game_id}/players",
    response_model=List[schemas.StatisticOut],
    summary="Alias em inglês para listar estatísticas dos jogadores de um jogo",
)
def stats_game_players_english(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Reaproveita a função existente, pode ser customizada se necessário
    return listar_stats_game(game_id, db, current_user)

# --- NOVO: Router para /stats ---
from fastapi import APIRouter as FastAPIRouter
stats_router = FastAPIRouter(
    prefix="/stats",
    tags=["stats"],
    redirect_slashes=False,
)

@stats_router.get(
    "/games/{game_id}",
    response_model=List[schemas.StatisticOut],
    summary="List game stats (english, no /statistics prefix)",
)
def stats_game_english_direct(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return listar_stats_game(game_id, db, current_user)

@stats_router.post(
    "/games/{game_id}",
    response_model=schemas.StatisticOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create game stat (english, no /statistics prefix)",
)
def create_stats_game_english_direct(
    game_id: int,
    statistic_in: schemas.StatisticCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    statistic_in.game_id = game_id
    return create_statistic(statistic_in, db, current_user)

@stats_router.get(
    "/games/{game_id}/players",
    response_model=List[schemas.StatisticOut],
    summary="List player stats for a game (english, no /statistics prefix)",
)
def stats_game_players_english_direct(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return listar_stats_game(game_id, db, current_user)

# Rota específica para compatibilidade com frontend: /estatisticas/stats/games/{game_id}
@router.post(
    "/estatisticas/stats/games/{game_id}",
    response_model=schemas.StatisticOut,
    status_code=status.HTTP_201_CREATED,
    summary="Rota específica para compatibilidade com frontend",
)
def create_stats_game_frontend(
    game_id: int,
    statistic_in: schemas.StatisticCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Garante que o game_id do path é usado
    statistic_in.game_id = game_id
    return create_statistic(statistic_in, db, current_user)

# Rota específica para compatibilidade com frontend: GET /estatisticas/stats/games/{game_id}
@router.get(
    "/estatisticas/stats/games/{game_id}",
    response_model=List[schemas.StatisticOut],
    summary="Rota específica para compatibilidade com frontend - GET",
)
def get_stats_game_frontend(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return listar_stats_game(game_id, db, current_user)

# Rota específica para compatibilidade com frontend: GET /estatisticas/stats/games/{game_id}/players
@router.get(
    "/estatisticas/stats/games/{game_id}/players",
    response_model=List[schemas.StatisticOut],
    summary="Rota específica para compatibilidade com frontend - GET players",
)
def get_stats_game_players_frontend(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return listar_stats_game(game_id, db, current_user)

# No final do arquivo, exporte o novo router:
# from .estatisticas import router as estatisticas_router, stats_router
