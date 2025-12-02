# backend/app/core/security.py

from datetime import timedelta, datetime
from typing import Any, Union, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.models import User
from app.database import get_db
from app.core.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
http_bearer_optional = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"

__all__ = ["ALGORITHM", "create_access_token", "verify_password", "get_password_hash", "verify_access_token", "get_current_user", "get_current_user_optional"]

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    # A biblioteca python-jose exige que o sub seja uma string
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    print("[DEBUG] Token recebido:", token)
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        print("[DEBUG] Payload decodificado:", payload)
        user_id = payload.get("sub")
        print("[DEBUG] User ID extraído:", user_id)
        print("[DEBUG] Tipo do user_id:", type(user_id))
        
        if user_id is None:
            print("[DEBUG] Payload sem 'sub'")
            raise credentials_exception
            
        # Converter para int se necessário
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
                print("[DEBUG] User ID convertido para int:", user_id)
            except ValueError as e:
                print("[DEBUG] Erro ao converter user_id para int:", e)
                raise credentials_exception
                
    except JWTError as e:
        print("[DEBUG] Erro ao decodificar JWT:", e)
        raise credentials_exception

    print("[DEBUG] Buscando usuário com ID:", user_id)
    user = db.query(User).filter(User.id == user_id).first()
    print("[DEBUG] Usuário encontrado:", user)
    if user is None:
        print("[DEBUG] Usuário não encontrado para ID:", user_id)
        raise credentials_exception
    return user

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Versão opcional de get_current_user que retorna None se não houver token"""
    if credentials is None:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                return None
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except (JWTError, Exception):
        return None
