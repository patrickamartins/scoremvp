from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import logging

from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user
from app.models.base import game_player

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)

logger = logging.getLogger(__name__)

def get_stats_query(db: Session, data_inicio: Optional[datetime] = None, data_fim: Optional[datetime] = None):
    query = db.query(models.Game)

    # Se nenhuma data for fornecida, assume o ano corrente como padrão
    if data_inicio is None and data_fim is None:
        current_year = date.today().year
        data_inicio = datetime(current_year, 1, 1)
        data_fim = datetime(current_year, 12, 31, 23, 59, 59)

    if data_inicio:
        query = query.filter(models.Game.date >= data_inicio)
    if data_fim:
        query = query.filter(models.Game.date <= data_fim)
    return query

@router.get("/public/overview", response_model=Dict[str, Any])
def get_public_overview(
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    jogo_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    if jogo_id:
        jogos_query = db.query(models.Game).filter(models.Game.id == jogo_id)
    else:
        jogos_query = get_stats_query(db, data_inicio, data_fim)

    jogos = jogos_query.all()
    jogos_ids = [j.id for j in jogos]
    
    logger.info(f"Dashboard overview: jogos_ids={jogos_ids}")
    if not jogos_ids:
        return {
            "total_jogos": 0,
            "estatisticas_gerais": {
                "total_pontos": 0,
                "total_assistencias": 0,
                "total_rebotes": 0,
                "total_roubos": 0,
                "total_faltas": 0,
                "media_pontos": 0,
                "media_assistencias": 0,
                "media_rebotes": 0,
                "media_roubos": 0,
                "media_faltas": 0
            },
            "jogadora_mais_pontos": None,
            "ultimos_jogos": []
        }

    total_jogos = len(jogos)

    estatisticas_gerais = db.query(
        func.sum(models.Statistic.points).label('total_pontos'),
        func.sum(models.Statistic.assists).label('total_assistencias'),
        func.sum(models.Statistic.rebounds).label('total_rebotes'),
        func.sum(models.Statistic.steals).label('total_roubos'),
        func.sum(models.Statistic.fouls).label('total_faltas'),
        func.avg(models.Statistic.points).label('media_pontos'),
        func.avg(models.Statistic.assists).label('media_assistencias'),
        func.avg(models.Statistic.rebounds).label('media_rebotes'),
        func.avg(models.Statistic.steals).label('media_roubos'),
        func.avg(models.Statistic.fouls).label('media_faltas')
    ).filter(
        models.Statistic.game_id.in_(jogos_ids)
    ).first()

    jogadora_mais_pontos = db.query(
        models.Player,
        func.sum(models.Statistic.points).label('total_pontos')
    ).join(
        models.Statistic
    ).filter(
        models.Statistic.game_id.in_(jogos_ids)
    ).group_by(
        models.Player.id
    ).order_by(
        func.sum(models.Statistic.points).desc()
    ).first()

    ultimos_jogos = sorted(jogos, key=lambda j: j.date, reverse=True)[:5]

    return {
        "total_jogos": total_jogos,
        "estatisticas_gerais": {
            "total_pontos": estatisticas_gerais.total_pontos if estatisticas_gerais and estatisticas_gerais.total_pontos is not None else 0,
            "total_assistencias": estatisticas_gerais.total_assistencias if estatisticas_gerais and estatisticas_gerais.total_assistencias is not None else 0,
            "total_rebotes": estatisticas_gerais.total_rebotes if estatisticas_gerais and estatisticas_gerais.total_rebotes is not None else 0,
            "total_roubos": estatisticas_gerais.total_roubos if estatisticas_gerais and estatisticas_gerais.total_roubos is not None else 0,
            "total_faltas": estatisticas_gerais.total_faltas if estatisticas_gerais and estatisticas_gerais.total_faltas is not None else 0,
            "media_pontos": round(estatisticas_gerais.media_pontos, 2) if estatisticas_gerais and estatisticas_gerais.media_pontos is not None else 0,
            "media_assistencias": round(estatisticas_gerais.media_assistencias, 2) if estatisticas_gerais and estatisticas_gerais.media_assistencias is not None else 0,
            "media_rebotes": round(estatisticas_gerais.media_rebotes, 2) if estatisticas_gerais and estatisticas_gerais.media_rebotes is not None else 0,
            "media_roubos": round(estatisticas_gerais.media_roubos, 2) if estatisticas_gerais and estatisticas_gerais.media_roubos is not None else 0,
            "media_faltas": round(estatisticas_gerais.media_faltas, 2) if estatisticas_gerais and estatisticas_gerais.media_faltas is not None else 0
        },
        "jogadora_mais_pontos": {
            "id": jogadora_mais_pontos[0].id,
            "nome": jogadora_mais_pontos[0].name,
            "total_pontos": jogadora_mais_pontos[1]
        } if jogadora_mais_pontos and jogadora_mais_pontos[0] else None,
        "ultimos_jogos": [
            {
                "id": jogo.id,
                "opponent": jogo.opponent,
                "date": jogo.date,
                "status": jogo.status
            }
            for jogo in ultimos_jogos
        ]
    }

@router.get("/public/jogadoras", response_model=List[Dict[str, Any]])
def get_public_jogadoras_stats(
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    jogo_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    if jogo_id:
        jogos_query = db.query(models.Game).filter(models.Game.id == jogo_id)
    else:
        jogos_query = get_stats_query(db, data_inicio, data_fim)

    jogos = jogos_query.all()
    jogos_ids = [j.id for j in jogos]

    logger.info(f"Dashboard jogadoras: jogos_ids={jogos_ids}")
    if not jogos_ids:
        return []

    # Lógica corrigida: busca jogadoras que têm estatísticas nos jogos filtrados
    player_ids_with_stats = db.query(models.Statistic.player_id).filter(
        models.Statistic.game_id.in_(jogos_ids)
    ).distinct().all()

    player_ids = [p_id for p_id, in player_ids_with_stats]
    if not player_ids:
        return []

    jogadoras = db.query(models.Player).filter(models.Player.id.in_(player_ids)).all()
    stats = []

    for jogadora in jogadoras:
        # Estatísticas da jogadora
        estatisticas = db.query(
            func.avg(models.Statistic.points).label('media_pontos'),
            func.avg(models.Statistic.assists).label('media_assistencias'),
            func.avg(models.Statistic.rebounds).label('media_rebotes'),
            func.avg(models.Statistic.steals).label('media_roubos'),
            func.avg(models.Statistic.fouls).label('media_faltas'),
            func.count(models.Statistic.id).label('total_jogos'),
            func.sum(models.Statistic.points).label('total_pontos'),
            func.sum(models.Statistic.assists).label('total_assistencias'),
            func.sum(models.Statistic.rebounds).label('total_rebotes'),
            func.sum(models.Statistic.steals).label('total_roubos'),
            func.sum(models.Statistic.fouls).label('total_faltas')
        ).filter(
            models.Statistic.player_id == jogadora.id,
            models.Statistic.game_id.in_(jogos_ids)
        ).first()

        if estatisticas and estatisticas.total_jogos > 0:
            stats.append({
                "id": jogadora.id,
                "name": jogadora.name,
                "number": jogadora.number,
                "position": jogadora.position,
                "categoria": jogadora.categoria,
                "active": jogadora.active,
                "created_at": jogadora.created_at,
                "media_pontos": round(estatisticas.media_pontos or 0, 2),
                "media_assistencias": round(estatisticas.media_assistencias or 0, 2),
                "media_rebotes": round(estatisticas.media_rebotes or 0, 2),
                "media_roubos": round(estatisticas.media_roubos or 0, 2),
                "media_faltas": round(estatisticas.media_faltas or 0, 2),
                "total_jogos": estatisticas.total_jogos or 0,
                "total_pontos": estatisticas.total_pontos or 0,
                "total_assistencias": estatisticas.total_assistencias or 0,
                "total_rebotes": estatisticas.total_rebotes or 0,
                "total_roubos": estatisticas.total_roubos or 0,
                "total_faltas": estatisticas.total_faltas or 0
            })

    return stats

@router.get("/public/jogos", response_model=List[Dict[str, Any]])
def get_public_jogos_stats(
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    jogos_query = get_stats_query(db, data_inicio, data_fim)
    jogos = jogos_query.order_by(models.Game.date.desc()).all()
    logger.info(f"Dashboard jogos: jogos={[(j.id, j.date) for j in jogos]}")
    if not jogos:
        return []
    stats = []

    for jogo in jogos:
        # Estatísticas do jogo
        estatisticas = db.query(
            func.sum(models.Statistic.points).label('total_pontos'),
            func.sum(models.Statistic.assists).label('total_assistencias'),
            func.sum(models.Statistic.rebounds).label('total_rebotes'),
            func.sum(models.Statistic.steals).label('total_roubos'),
            func.sum(models.Statistic.fouls).label('total_faltas'),
            func.count(models.Statistic.id).label('total_jogadoras')
        ).filter(
            models.Statistic.game_id == jogo.id
        ).first()

        # Estatísticas por quarto
        estatisticas_por_quarto = db.query(
            models.Statistic.quarter,
            func.sum(models.Statistic.points).label('total_pontos'),
            func.sum(models.Statistic.assists).label('total_assistencias'),
            func.sum(models.Statistic.rebounds).label('total_rebotes'),
            func.sum(models.Statistic.steals).label('total_roubos'),
            func.sum(models.Statistic.fouls).label('total_faltas')
        ).filter(
            models.Statistic.game_id == jogo.id
        ).group_by(models.Statistic.quarter).order_by(models.Statistic.quarter).all()

        if estatisticas:
            stats.append({
                "id": jogo.id,
                "opponent": jogo.opponent,
                "date": jogo.date,
                "status": jogo.status,
                "total_pontos": estatisticas.total_pontos or 0,
                "total_assistencias": estatisticas.total_assistencias or 0,
                "total_rebotes": estatisticas.total_rebotes or 0,
                "total_roubos": estatisticas.total_roubos or 0,
                "total_faltas": estatisticas.total_faltas or 0,
                "total_jogadoras": estatisticas.total_jogadoras or 0,
                "por_quarto": [
                    {
                        "quarto": q[0],
                        "total_pontos": q[1] or 0,
                        "total_assistencias": q[2] or 0,
                        "total_rebotes": q[3] or 0,
                        "total_roubos": q[4] or 0,
                        "total_faltas": q[5] or 0
                    } for q in estatisticas_por_quarto
                ]
            })

    return stats 