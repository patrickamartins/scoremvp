from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from typing import List
from app.models.user import User
from app.models.player import Player
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.core.deps import get_db, get_current_active_superadmin
from sqlalchemy.orm import Session
# from app.services.user_service import UserService
import os
from app.schemas.player import PlayerOut

router = APIRouter()

MEDIA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../media')
os.makedirs(MEDIA_DIR, exist_ok=True)

def user_to_out(user: User) -> dict:
    # Buscar player vinculado
    player = getattr(user, 'player_profile', None)
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "is_active": user.is_active,
        "number": player.number if player else None,
        "position": player.position if player else None,
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
    # Garantir que player_profile está carregado
    for user in users:
        _ = getattr(user, 'player_profile', None)
    return [user_to_out(user) for user in users]

# Endpoint para listar jogadores com usuário vinculado
@router.get("/players-with-user", response_model=List[PlayerOut])
def get_players_with_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    players = db.query(Player).filter(Player.user_id.isnot(None)).all()
    return players

@router.post("/", response_model=UserOut)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    from app.core.security import get_password_hash
    user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        plan=user_in.plan,
        is_active=user_in.is_active,
        profile_image=user_in.profile_image
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Criar player vinculado
    player = Player(
        name=user.name,
        number=getattr(user_in, 'number', None),
        position=getattr(user_in, 'position', None),
        user_id=user.id
    )
    db.add(player)
    db.commit()
    db.refresh(user)
    return user_to_out(user)

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data:
        from app.core.security import get_password_hash
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    # Atualizar player vinculado, se existir
    player = getattr(user, 'player_profile', None)
    if player:
        if "number" in update_data:
            player.number = update_data["number"]
        if "position" in update_data:
            player.position = update_data["position"]
        db.add(player)
    
    db.commit()
    db.refresh(user)
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
    # O player vinculado acessa a foto via user.profile_image
    return {"filename": file.filename, "url": user.profile_image} 

@router.patch("/{user_id}/link-player/{player_id}")
def link_player_to_user(user_id: int, player_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    user = db.query(User).filter(User.id == user_id).first()
    player = db.query(Player).filter(Player.id == player_id).first()
    if not user or not player:
        raise HTTPException(status_code=404, detail="User or Player not found")
    player.user_id = user.id
    db.add(player)
    db.commit()
    return {"message": f"Player {player.name} vinculado ao usuário {user.name}"} 