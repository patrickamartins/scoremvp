from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import database, models, core
from app.core.security import get_current_user
from app.models.user import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Re-export get_db from database
get_db = database.get_db

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    username = core.verify_access_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_role(*roles: UserRole):
    def role_checker(user=Depends(get_current_user)):
        if user.role not in [role.value for role in roles]:
            raise HTTPException(status_code=403, detail="Acesso negado")
        return user
    return role_checker
