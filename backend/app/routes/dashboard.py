from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)

logger = logging.getLogger(__name__)

def get_stats_query(db: Session, data_inicio: Optional[datetime] = None, data_fim: Optional[datetime] = None):
    query = db.query(models.Jogo)
    if data_inicio:
        query = query.filter(models.Jogo.date >= data_inicio)
    if data_fim:
        query = query.filter(models.Jogo.date <= data_fim)
    return query

@router.get("/public/overview", response_model=Dict[str, Any])
def get_public_overview(
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    jogos_query = get_stats_query(db, data_inicio, data_fim)
    jogos_ids = [j.id for j in jogos_query.all()]
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

    # Total de jogos
    total_jogos = jogos_query.count()

    # Estatísticas gerais do time
    estatisticas_gerais = db.query(
        func.sum(models.Estatistica.pontos).label('total_pontos'),
        func.sum(models.Estatistica.assistencias).label('total_assistencias'),
        func.sum(models.Estatistica.rebotes).label('total_rebotes'),
        func.sum(models.Estatistica.roubos).label('total_roubos'),
        func.sum(models.Estatistica.faltas).label('total_faltas'),
        func.avg(models.Estatistica.pontos).label('media_pontos'),
        func.avg(models.Estatistica.assistencias).label('media_assistencias'),
        func.avg(models.Estatistica.rebotes).label('media_rebotes'),
        func.avg(models.Estatistica.roubos).label('media_roubos'),
        func.avg(models.Estatistica.faltas).label('media_faltas')
    ).join(
        models.Jogo
    ).filter(
        models.Jogo.id.in_([j.id for j in jogos_query.all()])
    ).first()

    # Jogadora com mais pontos
    jogadora_mais_pontos = db.query(
        models.Jogadora,
        func.sum(models.Estatistica.pontos).label('total_pontos')
    ).join(
        models.Estatistica
    ).join(
        models.Jogo
    ).filter(
        models.Jogo.id.in_([j.id for j in jogos_query.all()])
    ).group_by(
        models.Jogadora.id
    ).order_by(
        func.sum(models.Estatistica.pontos).desc()
    ).first()

    # Últimos jogos
    ultimos_jogos = jogos_query.order_by(
        models.Jogo.date.desc()
    ).limit(5).all()

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
            "nome": jogadora_mais_pontos[0].nome,
            "total_pontos": jogadora_mais_pontos[1]
        } if jogadora_mais_pontos else None,
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
    db: Session = Depends(get_db),
):
    jogos_query = get_stats_query(db, data_inicio, data_fim)
    jogos_ids = [j.id for j in jogos_query.all()]
    logger.info(f"Dashboard jogadoras: jogos_ids={jogos_ids}")
    if not jogos_ids:
        return []

    # Buscar apenas jogadoras convocadas para os jogos filtrados
    jogadoras = db.query(models.Jogadora).join(models.jogo_jogadora).filter(
        models.jogo_jogadora.c.jogo_id.in_(jogos_ids)
    ).distinct().all()
    stats = []

    for jogadora in jogadoras:
        # Estatísticas da jogadora
        estatisticas = db.query(
            func.avg(models.Estatistica.pontos).label('media_pontos'),
            func.avg(models.Estatistica.assistencias).label('media_assistencias'),
            func.avg(models.Estatistica.rebotes).label('media_rebotes'),
            func.avg(models.Estatistica.roubos).label('media_roubos'),
            func.avg(models.Estatistica.faltas).label('media_faltas'),
            func.count(models.Estatistica.id).label('total_jogos'),
            func.sum(models.Estatistica.pontos).label('total_pontos'),
            func.sum(models.Estatistica.assistencias).label('total_assistencias'),
            func.sum(models.Estatistica.rebotes).label('total_rebotes'),
            func.sum(models.Estatistica.roubos).label('total_roubos'),
            func.sum(models.Estatistica.faltas).label('total_faltas')
        ).filter(
            models.Estatistica.jogadora_id == jogadora.id
        ).join(
            models.Jogo
        ).filter(
            models.Jogo.id.in_(jogos_ids)
        ).first()

        if estatisticas:
            stats.append({
                "id": jogadora.id,
                "nome": jogadora.nome,
                "numero": jogadora.numero,
                "posicao": jogadora.posicao,
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
    jogos = jogos_query.order_by(models.Jogo.date.desc()).all()
    logger.info(f"Dashboard jogos: jogos={[(j.id, j.date) for j in jogos]}")
    if not jogos:
        return []
    stats = []

    for jogo in jogos:
        # Estatísticas do jogo
        estatisticas = db.query(
            func.sum(models.Estatistica.pontos).label('total_pontos'),
            func.sum(models.Estatistica.assistencias).label('total_assistencias'),
            func.sum(models.Estatistica.rebotes).label('total_rebotes'),
            func.sum(models.Estatistica.roubos).label('total_roubos'),
            func.sum(models.Estatistica.faltas).label('total_faltas'),
            func.count(models.Estatistica.id).label('total_jogadoras')
        ).filter(
            models.Estatistica.jogo_id == jogo.id
        ).first()

        # Estatísticas por quarto
        estatisticas_por_quarto = db.query(
            models.Estatistica.quarto,
            func.sum(models.Estatistica.pontos).label('total_pontos'),
            func.sum(models.Estatistica.assistencias).label('total_assistencias'),
            func.sum(models.Estatistica.rebotes).label('total_rebotes'),
            func.sum(models.Estatistica.roubos).label('total_roubos'),
            func.sum(models.Estatistica.faltas).label('total_faltas')
        ).filter(
            models.Estatistica.jogo_id == jogo.id
        ).group_by(models.Estatistica.quarto).order_by(models.Estatistica.quarto).all()

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