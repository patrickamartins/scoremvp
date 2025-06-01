from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/estatisticas",
    tags=["estatisticas"],
)

@router.post(
    "/",
    response_model=schemas.EstatisticaOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registra uma nova estatística",
)
def criar_estatistica(
    estatistica_in: schemas.EstatisticaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verifica se o jogo existe e pertence ao usuário
    jogo = db.query(models.Jogo).filter(
        models.Jogo.id == estatistica_in.jogo_id,
        models.Jogo.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    # Verifica se a jogadora existe
    jogadora = db.query(models.Jogadora).filter(
        models.Jogadora.id == estatistica_in.jogadora_id
    ).first()
    if not jogadora:
        raise HTTPException(status_code=404, detail="Jogadora não encontrada")
    
    # Verifica se já existe estatística para essa jogadora, jogo e quarto
    estatistica_existente = db.query(models.Estatistica).filter(
        models.Estatistica.jogo_id == estatistica_in.jogo_id,
        models.Estatistica.jogadora_id == estatistica_in.jogadora_id,
        models.Estatistica.quarto == estatistica_in.quarto
    ).first()
    
    if estatistica_existente:
        # Atualiza a estatística existente
        for field, value in estatistica_in.dict().items():
            setattr(estatistica_existente, field, value)
        db.commit()
        db.refresh(estatistica_existente)
        return estatistica_existente
    
    # Cria nova estatística
    nova = models.Estatistica(**estatistica_in.dict())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@router.get(
    "/jogo/{jogo_id}",
    response_model=List[schemas.EstatisticaOut],
    summary="Lista estatísticas de um jogo",
)
def listar_estatisticas_jogo(
    jogo_id: int,
    quarto: Optional[int] = None,
    jogadora_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verifica se o jogo existe e pertence ao usuário
    jogo = db.query(models.Jogo).filter(
        models.Jogo.id == jogo_id,
        models.Jogo.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    query = db.query(models.Estatistica).filter(
        models.Estatistica.jogo_id == jogo_id
    )
    
    if quarto:
        query = query.filter(models.Estatistica.quarto == quarto)
    if jogadora_id:
        query = query.filter(models.Estatistica.jogadora_id == jogadora_id)
    
    return query.all()

@router.get(
    "/jogo/{jogo_id}/resumo",
    response_model=schemas.EstatisticasResumo,
    summary="Retorna resumo das estatísticas do jogo",
)
def resumo_estatisticas_jogo(
    jogo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verifica se o jogo existe e pertence ao usuário
    jogo = db.query(models.Jogo).filter(
        models.Jogo.id == jogo_id,
        models.Jogo.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    # Busca todas as estatísticas do jogo
    estatisticas = db.query(models.Estatistica).filter(
        models.Estatistica.jogo_id == jogo_id
    ).all()
    
    # Calcula totais gerais
    totais = {
        "total_pontos": sum(e.pontos for e in estatisticas),
        "total_assistencias": sum(e.assistencias for e in estatisticas),
        "total_rebotes": sum(e.rebotes for e in estatisticas),
        "total_roubos": sum(e.roubos for e in estatisticas),
        "total_faltas": sum(e.faltas for e in estatisticas),
    }
    
    # Calcula totais por quarto
    por_quarto = {}
    for quarto in range(1, 5):  # 1 a 4 quartos
        stats_quarto = [e for e in estatisticas if e.quarto == quarto]
        por_quarto[quarto] = {
            "quarto": quarto,
            "total_pontos": sum(e.pontos for e in stats_quarto),
            "total_assistencias": sum(e.assistencias for e in stats_quarto),
            "total_rebotes": sum(e.rebotes for e in stats_quarto),
            "total_roubos": sum(e.roubos for e in stats_quarto),
            "total_faltas": sum(e.faltas for e in stats_quarto),
        }
    
    return {
        **totais,
        "por_quarto": list(por_quarto.values())
    }

@router.put(
    "/{estatistica_id}",
    response_model=schemas.EstatisticaOut,
    summary="Atualiza uma estatística",
)
def atualizar_estatistica(
    estatistica_id: int,
    estatistica_in: schemas.EstatisticaUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    estatistica = db.query(models.Estatistica).join(
        models.Jogo
    ).filter(
        models.Estatistica.id == estatistica_id,
        models.Jogo.owner_id == current_user.id
    ).first()
    
    if not estatistica:
        raise HTTPException(status_code=404, detail="Estatística não encontrada")
    
    for field, value in estatistica_in.dict(exclude_unset=True).items():
        setattr(estatistica, field, value)
    
    db.commit()
    db.refresh(estatistica)
    return estatistica

@router.delete(
    "/{estatistica_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove uma estatística",
)
def remover_estatistica(
    estatistica_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    estatistica = db.query(models.Estatistica).join(
        models.Jogo
    ).filter(
        models.Estatistica.id == estatistica_id,
        models.Jogo.owner_id == current_user.id
    ).first()
    
    if not estatistica:
        raise HTTPException(status_code=404, detail="Estatística não encontrada")
    
    db.delete(estatistica)
    db.commit()
    return None

@router.get(
    "/public/jogo/{jogo_id}",
    response_model=List[schemas.EstatisticaOut],
    summary="Lista estatísticas públicas de um jogo",
)
def listar_estatisticas_publicas(
    jogo_id: int,
    quarto: Optional[int] = None,
    jogadora_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    jogo = db.query(models.Jogo).filter(
        models.Jogo.id == jogo_id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    query = db.query(models.Estatistica).filter(
        models.Estatistica.jogo_id == jogo_id
    )
    
    if quarto:
        query = query.filter(models.Estatistica.quarto == quarto)
    if jogadora_id:
        query = query.filter(models.Estatistica.jogadora_id == jogadora_id)
    
    return query.all()
