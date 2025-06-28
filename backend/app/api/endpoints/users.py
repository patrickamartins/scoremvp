from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.crud import user as crud
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    UserFilter,
    UserPagination
)
from app.models.user import User, UserRole, UserPlan
import os
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/", response_model=List[UserListResponse])
def get_users(
    name: Optional[str] = None,
    email: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    Listar usuários (apenas admin).
    """
    filters = UserFilter(name=name, email=email, role=role, is_active=is_active)
    pagination = UserPagination(skip=skip, limit=limit)
    users, total = crud.get_users(db, filters, pagination)
    return users

@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    Criar novo usuário (apenas admin).
    """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado"
        )
    return crud.create_user(db=db, user=user)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    Obter detalhes de um usuário (apenas admin).
    """
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    name: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    is_active: bool = Form(...),
    plan: str = Form(...),
    profileImage: UploadFile = File(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    Atualizar usuário (apenas admin), incluindo upload de foto de perfil.
    """
    image_url = None
    if profileImage:
        os.makedirs("media/avatars", exist_ok=True)
        file_location = f"media/avatars/{user_id}_{profileImage.filename}"
        with open(file_location, "wb") as f:
            f.write(await profileImage.read())
        image_url = f"/media/avatars/{user_id}_{profileImage.filename}"

    user_update = {
        "name": name,
        "email": email,
        "role": role,
        "is_active": is_active,
        "plan": plan,
    }
    if image_url:
        user_update["profile_image"] = image_url

    db_user = crud.update_user(db, user_id=user_id, user_update=user_update)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return db_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    Deletar usuário (apenas admin).
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar seu próprio usuário"
        )
    
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return {"message": "Usuário deletado com sucesso"}

@router.post("/{user_id}/subscription/cancel")
def cancel_subscription(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    Cancelar assinatura de um usuário (apenas admin).
    """
    db_user = crud.cancel_subscription(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return {"message": "Assinatura cancelada com sucesso"} 