# backend/app/routes/players.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user
import logging

router = APIRouter(
    prefix="/players",
    tags=["players"],
    redirect_slashes=False,
)

logger = logging.getLogger(__name__)


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
    try:
        nova = models.Player(**player_in.dict())
        db.add(nova)
        db.commit()
        db.refresh(nova)
        return schemas.PlayerOut.from_orm(nova)
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Erro de integridade ao criar jogadora: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma jogadora com esse nome ou número. Escolha outro."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar jogadora: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar jogadora: {str(e)}"
        )


@router.get(
    "/",
    response_model=list[schemas.PlayerOut],
    summary="Lista todas as jogadoras",
)
def listar_jogadoras(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        jogadoras = db.query(models.Player).all()
        return [schemas.PlayerOut.from_orm(j) for j in jogadoras]
    except Exception as e:
        logger.error(f"Erro ao listar jogadoras: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar jogadoras: {str(e)}"
        )


@router.get("", response_model=list[schemas.PlayerOut], include_in_schema=False)
def listar_jogadoras_sem_barra(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return listar_jogadoras(db, current_user)


@router.get(
    "/{player_id}",
    response_model=schemas.PlayerOut,
    summary="Consulta uma jogadora por ID",
)
def ler_jogadora(
    player_id: int,
    db: Session = Depends(get_db),
):
    jog = db.query(models.Player).filter(models.Player.id == player_id).first()
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
    jog = db.query(models.Player).filter(models.Player.id == player_id).first()
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
    jog = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not jog:
        raise HTTPException(status_code=404, detail="Jogadora não encontrada")
    db.delete(jog)
    db.commit()


@router.post("", response_model=schemas.PlayerOut, include_in_schema=False)
def criar_jogadora_sem_barra(
    player_in: schemas.PlayerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return criar_jogadora(player_in, db, current_user)
