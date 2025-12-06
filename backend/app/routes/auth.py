# backend/app/routes/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from itsdangerous import URLSafeTimedSerializer
import logging

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
from app.core.email import email_service
from app.schemas.auth import PasswordReset, PasswordResetRequest

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

def generate_reset_token(email: str) -> str:
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(email, salt=settings.SECURITY_PASSWORD_SALT)

def generate_activation_token(email: str) -> str:
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(email, salt=settings.SECURITY_PASSWORD_SALT + "_activation")

def verify_activation_token(token: str, max_age: int = 86400) -> str:  # 24 horas
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        return serializer.loads(token, salt=settings.SECURITY_PASSWORD_SALT + "_activation", max_age=max_age)
    except:
        return None

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

@router.get("/check-email/{email}")
def check_email_exists(email: str, db: Session = Depends(get_db)):
    """Verifica se um email já está cadastrado"""
    user = db.query(User).filter(User.email == email).first()
    return {"exists": user is not None}

@router.get("/check-cpf/{cpf}")
def check_cpf_exists(cpf: str, db: Session = Depends(get_db)):
    """Verifica se um CPF/CNPJ já está cadastrado"""
    user = db.query(User).filter(User.cpf == cpf).first()
    return {"exists": user is not None}

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
    activation_token = generate_activation_token(user_in.email)
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_active=False,  # Requer ativação
        email_verified=False,
        activation_token=activation_token,
        cpf=user_in.cpf,  # Salvar CPF/CNPJ se fornecido
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Enviar email de ativação
    try:
        email_service.send_activation_email(
            email=user.email,
            name=user.name,
            activation_token=activation_token
        )
    except Exception as e:
        logger.error(f"Erro ao enviar email de ativação: {e}")
        # Não falha o registro se o email não for enviado
    
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
    
    # Verificar se a conta está ativada
    # Para usuários antigos (is_active=True mas email_verified pode ser False/NULL),
    # considerar como ativado se is_active=True
    # Para novos usuários, exigir ambos
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta não ativada. Verifique seu email para ativar sua conta.",
        )
    
    # Se o usuário está ativo mas email_verified é False/NULL (usuário antigo),
    # atualizar email_verified para True automaticamente
    if user.is_active and (user.email_verified is None or user.email_verified is False):
        try:
            user.email_verified = True
            db.commit()
            print(f"[DEBUG] Atualizado email_verified para True para usuário antigo: {user.email}")
        except Exception as e:
            print(f"[DEBUG] Erro ao atualizar email_verified: {e}")
            db.rollback()
            # Continuar mesmo se não conseguir atualizar (usuário antigo)
    
    # Não bloquear usuários antigos que estão ativos, mesmo se email_verified for False
    # Apenas bloquear novos usuários que não ativaram (is_active=False)
    access_token = create_access_token(
        subject=user.id,
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

@router.post("/forgot-password", response_model=dict)
def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
) -> dict:
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Por segurança, sempre retorna a mesma mensagem
        return {"message": "Se o email existir, você receberá as instruções de recuperação de senha."}
    
    token = generate_reset_token(user.email)
    try:
        success = email_service.send_password_reset_email(
            email=user.email,
            reset_token=token
        )
        if not success:
            logger.error(f"Falha ao enviar email de recuperação de senha para {user.email}")
            # Ainda retorna sucesso por segurança, mas loga o erro
    except Exception as e:
        logger.error(f"Erro ao enviar email de recuperação de senha: {e}")
        # Não levanta exceção para não revelar se o email existe ou não
        # Apenas loga o erro
    
    # Sempre retorna a mesma mensagem por segurança
    return {"message": "Se o email existir, você receberá as instruções de recuperação de senha."}

@router.post("/reset-password", response_model=dict)
def reset_password(
    request: PasswordReset,
    db: Session = Depends(get_db)
) -> dict:
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

@router.get("/activate/{token}", response_model=dict)
def activate_account(
    token: str,
    db: Session = Depends(get_db)
) -> dict:
    """Ativa a conta do usuário usando o token de ativação"""
    email = verify_activation_token(token)
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
    
    if user.email_verified:
        return {"message": "Conta já está ativada"}
    
    # Ativar conta
    user.is_active = True
    user.email_verified = True
    user.activation_token = None
    db.add(user)
    db.commit()
    
    # Enviar email de boas-vindas
    try:
        email_service.send_welcome_email(
            email=user.email,
            name=user.name
        )
    except Exception as e:
        logger.error(f"Erro ao enviar email de boas-vindas: {e}")
    
    return {"message": "Conta ativada com sucesso! Você receberá um email de boas-vindas."}
