from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from typing import List
from app.models.user import User
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.core.deps import get_db, get_current_active_superadmin
from sqlalchemy.orm import Session
from app.services.user_service import UserService
import os

router = APIRouter()

MEDIA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../media')
os.makedirs(MEDIA_DIR, exist_ok=True)

def user_to_out(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.name,
        "role": user.role,
        "is_active": user.is_active,
        "number": str(user.number) if user.number is not None else None,
        "position": user.position,
        "profile_image": user.profile_image,
        "phone": user.phone,
        "cpf": user.cpf,
        "favorite_team": user.favorite_team,
        "playing_team": user.playing_team,
        "plan": user.plan,
    }

@router.get("/", response_model=List[UserOut])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    users = db.query(User).offset(skip).limit(limit).all()
    return [user_to_out(user) for user in users]

@router.post("/", response_model=UserOut)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    user_service = UserService(db)
    user = user_service.create_user(user_in)
    return user_to_out(user)

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    user_service = UserService(db)
    user = user_service.update_user(user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_out(user)

@router.post("/{user_id}/photo")
async def upload_user_photo(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superadmin)
):
    contents = await file.read()
    file_path = os.path.join(MEDIA_DIR, f"user_{user_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(contents)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.profile_image = f"/media/user_{user_id}_{file.filename}"
    db.commit()
    db.refresh(user)
    return {"filename": file.filename, "url": user.profile_image} 