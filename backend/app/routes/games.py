# backend/app/routes/games.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter(
    prefix="/games",
    tags=["games"],
)


@router.post(
    "/",
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
    novo = models.Jogo(
        opponent=data['opponent'],
        date=data['date'],
        time=data.get('time'),
        location=data.get('location'),
        categoria=data.get('categoria'),
        status="PENDENTE",
        owner_id=current_user.id
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)

    # Adiciona as jogadoras selecionadas
    if data.get('jogadoras'):
        for jogadora_id in data['jogadoras']:
            jogadora = db.query(models.Jogadora).filter(models.Jogadora.id == jogadora_id).first()
            if jogadora:
                novo.jogadoras.append(jogadora)
        db.commit()
        db.refresh(novo)

    return schemas.GameOut.from_orm(novo)


@router.get(
    "/",
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
    query = db.query(models.Jogo).filter(models.Jogo.owner_id == current_user.id)
    
    if status:
        query = query.filter(models.Jogo.status == status)
    if data_inicio:
        query = query.filter(models.Jogo.date >= data_inicio)
    if data_fim:
        query = query.filter(models.Jogo.date <= data_fim)
    
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
    jogo = db.query(models.Jogo).filter(
        models.Jogo.id == game_id,
        models.Jogo.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return jogo


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
    jogo = db.query(models.Jogo).filter(
        models.Jogo.id == game_id,
        models.Jogo.owner_id == current_user.id
    ).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    for field, value in game_in.dict(exclude_unset=True).items():
        setattr(jogo, field, value)
    
    db.commit()
    db.refresh(jogo)
    return jogo


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
    jogo = db.query(models.Jogo).filter(
        models.Jogo.id == game_id,
        models.Jogo.owner_id == current_user.id
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
    jogo = db.query(models.Jogo).filter(models.Jogo.id == game_id).first()
    if not jogo:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return jogo
