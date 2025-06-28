from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app import database
from app.core import security
from app.core.config import settings
from app.models.user import UserRole, User
from app.services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Re-export get_db from database
get_db = database.get_db

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        email = security.verify_access_token(token)
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_role(*roles: UserRole):
    def role_checker(user=Depends(get_current_user)):
        if user.role not in [role.value for role in roles]:
            raise HTTPException(status_code=403, detail="Acesso negado")
        return user
    return role_checker
