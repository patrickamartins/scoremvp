# backend/app/routes/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models import User
from app.schemas.user import UserResponse, UserCreate
from app.schemas.token import Token
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.database import get_db
from app.core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registra um novo usuário",
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    # Verifica se o usuário já existe
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email já registrado",
        )
    
    # Cria o novo usuário
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post(
    "/login",
    response_model=Token,
    summary="Realiza login e retorna token JWT",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    print("[DEBUG] LOGIN ENDPOINT CHAMADO")
    print("[DEBUG] form_data.username:", form_data.username)
    print("[DEBUG] form_data.password:", form_data.password)
    user = db.query(User).filter(User.email == form_data.username).first()
    print("[DEBUG] user:", user)
    if not user or not verify_password(form_data.password, user.hashed_password):
        print("[DEBUG] Usuário não encontrado ou senha inválida")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        subject=user.email,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    print("[DEBUG] Login bem-sucedido para:", user.email)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retorna informações do usuário logado",
)
def read_users_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
