# backend/app/routes/players.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter(
    prefix="/players",
    tags=["players"],
)


@router.post(
    "/",
    response_model=schemas.PlayerOut,
    status_code=status.HTTP_201_CREATED,
    summary="Cria uma nova jogadora",
)
def criar_jogadora(
    player_in: schemas.PlayerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    nova = models.Jogadora(**player_in.dict())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return schemas.PlayerOut.from_orm(nova)


@router.get(
    "/",
    response_model=list[schemas.PlayerOut],
    summary="Lista todas as jogadoras",
)
def listar_jogadoras(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jogadoras = db.query(models.Jogadora).all()
    return [schemas.PlayerOut.from_orm(j) for j in jogadoras]


@router.get(
    "/{player_id}",
    response_model=schemas.PlayerOut,
    summary="Consulta uma jogadora por ID",
)
def ler_jogadora(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jog = db.query(models.Jogadora).filter(models.Jogadora.id == player_id).first()
    if not jog:
        raise HTTPException(status_code=404, detail="Jogadora não encontrada")
    return schemas.PlayerOut.from_orm(jog)


@router.put(
    "/{player_id}",
    response_model=schemas.PlayerOut,
    summary="Atualiza uma jogadora",
)
def atualizar_jogadora(
    player_id: int,
    player_in: schemas.PlayerUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jog = db.query(models.Jogadora).filter(models.Jogadora.id == player_id).first()
    if not jog:
        raise HTTPException(status_code=404, detail="Jogadora não encontrada")
    for key, val in player_in.dict(exclude_unset=True).items():
        setattr(jog, key, val)
    db.commit()
    db.refresh(jog)
    return schemas.PlayerOut.from_orm(jog)


@router.delete(
    "/{player_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove uma jogadora",
)
def deletar_jogadora(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jog = db.query(models.Jogadora).filter(models.Jogadora.id == player_id).first()
    if not jog:
        raise HTTPException(status_code=404, detail="Jogadora não encontrada")
    db.delete(jog)
    db.commit()
