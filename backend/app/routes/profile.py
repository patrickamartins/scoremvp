from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.schemas.user import UserResponse, UserUpdate
from app.models.user import User
from app.schemas.profile import UserStatsResponse, UserEventResponse
from app.crud import user as crud
from datetime import datetime

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Não permitir alteração de CPF
    if hasattr(user_update, 'cpf'):
        raise HTTPException(status_code=400, detail="Não é permitido alterar o CPF")
    db_user = crud.update_user(db, user_id=current_user.id, user_update=user_update.dict(exclude_unset=True))
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user

@router.get("/me/stats", response_model=UserStatsResponse)
def get_my_stats(
    year: Optional[int] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Buscar estatísticas individuais do usuário por ano
    # (Implementação mock, ajustar para buscar dados reais)
    if not year:
        year = datetime.now().year
    # Exemplo de retorno
    return UserStatsResponse(
        evolution=[{"month": m, "points": 100 + m*10} for m in range(1, 13)],
        assists=[{"month": m, "total": 5 + m} for m in range(1, 13)],
        free_throws=[{"month": m, "total": 3 + m} for m in range(1, 13)],
        rebounds=[{"month": m, "total": 7 + m} for m in range(1, 13)],
        # ... outras estatísticas ...
    )

@router.get("/me/events", response_model=List[UserEventResponse])
def get_my_events(
    year: Optional[int] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Buscar eventos/convocações do usuário por ano
    # (Implementação mock, ajustar para buscar dados reais)
    if not year:
        year = datetime.now().year
    return [
        UserEventResponse(date=f"2024-06-01", status="accepted", title="Convocação 1"),
        UserEventResponse(date=f"2024-06-10", status="pending", title="Evento 2"),
        UserEventResponse(date=f"2024-06-15", status="rejected", title="Convocação 3"),
    ] 