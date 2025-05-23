from datetime import datetime, timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from itsdangerous import URLSafeTimedSerializer

from app.core.config import settings
from app.core.email import EmailService
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import Token, PasswordReset, PasswordResetRequest

router = APIRouter()
email_service = EmailService()

def generate_reset_token(email: str) -> str:
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(email, salt=settings.SECURITY_PASSWORD_SALT)

def verify_reset_token(token: str, max_age: int = 3600) -> str:
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        email = serializer.loads(
            token,
            salt=settings.SECURITY_PASSWORD_SALT,
            max_age=max_age
        )
        return email
    except:
        return None

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password", response_model=dict)
def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
) -> Any:
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Não revelamos se o email existe ou não por questões de segurança
        return {"message": "Se o email existir, você receberá as instruções de recuperação de senha."}
    
    token = generate_reset_token(user.email)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    try:
        email_service.send_password_reset_email(
            email_to=user.email,
            reset_url=reset_url
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao enviar email de recuperação de senha"
        )
    
    return {"message": "Se o email existir, você receberá as instruções de recuperação de senha."}

@router.post("/reset-password", response_model=dict)
def reset_password(
    request: PasswordReset,
    db: Session = Depends(get_db)
) -> Any:
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    user.hashed_password = get_password_hash(request.new_password)
    db.add(user)
    db.commit()
    
    return {"message": "Senha alterada com sucesso"} 