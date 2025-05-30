# backend/app/routes/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.database import get_db
from app.core.settings import settings

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post(
    "/register",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registra um novo usuário",
)
def register(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    # Verifica se o usuário já existe
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email já registrado",
        )
    if db.query(models.User).filter(models.User.username == user_in.username).first():
        raise HTTPException(
            status_code=400,
            detail="Username já registrado",
        )
    
    # Cria o novo usuário
    user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.UserOut.from_orm(user)

@router.post(
    "/login",
    response_model=schemas.Token,
    summary="Realiza login e retorna token JWT",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Busca o usuário
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Cria o token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get(
    "/me",
    response_model=schemas.UserOut,
    summary="Retorna informações do usuário logado",
)
def read_users_me(
    current_user: models.User = Depends(get_current_user),
):
    return current_user
