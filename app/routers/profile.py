from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import List
from pydantic import BaseModel, EmailStr
from datetime import datetime
import os
from ..auth import get_current_user
from ..database import get_db
from sqlalchemy.orm import Session
from ..models import User, Game, GameStats, Event
import shutil
from pathlib import Path

router = APIRouter(prefix="/profile", tags=["profile"])

# Schemas
class ProfileBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    plan: str
    avatar: str | None = None
    level: str
    exp: int
    nextLevel: str
    nextLevelExp: int
    currentExp: int
    totalExp: int
    progress: int

class StatsEvolution(BaseModel):
    month: int
    points: int

class StatsAssist(BaseModel):
    month: int
    total: int

class StatsFreeThrow(BaseModel):
    month: int
    total: int

class StatsRebound(BaseModel):
    month: int
    total: int

class ProfileStats(BaseModel):
    evolution: List[StatsEvolution]
    assists: List[StatsAssist]
    free_throws: List[StatsFreeThrow]
    rebounds: List[StatsRebound]

class EventBase(BaseModel):
    date: datetime
    status: str
    title: str

# Configuração de upload
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def calculate_user_level(exp: int) -> tuple[str, str, int, int, int]:
    """Calcula o nível do usuário baseado na experiência"""
    levels = {
        "Bronze": 0,
        "Prata": 1000,
        "Ouro": 3000,
        "Platina": 6000,
        "Diamante": 10000
    }
    
    current_level = "Bronze"
    next_level = "Prata"
    
    for level, required_exp in levels.items():
        if exp >= required_exp:
            current_level = level
            # Encontrar próximo nível
            next_levels = list(levels.keys())
            current_index = next_levels.index(current_level)
            if current_index < len(next_levels) - 1:
                next_level = next_levels[current_index + 1]
            else:
                next_level = current_level
    
    next_level_exp = levels[next_level]
    progress = int((exp - levels[current_level]) / (next_level_exp - levels[current_level]) * 100) if next_level != current_level else 100
    
    return current_level, next_level, next_level_exp, exp, progress

@router.get("/me", response_model=ProfileBase)
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retorna o perfil do usuário atual"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    level, next_level, next_level_exp, current_exp, progress = calculate_user_level(user.exp)
    
    return {
        "name": user.name,
        "email": user.email,
        "phone": user.phone or "",
        "plan": user.plan or "Bronze",
        "avatar": user.avatar,
        "level": level,
        "exp": user.exp,
        "nextLevel": next_level,
        "nextLevelExp": next_level_exp,
        "currentExp": current_exp,
        "totalExp": user.exp,
        "progress": progress
    }

@router.get("/me/stats", response_model=ProfileStats)
async def get_profile_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retorna as estatísticas do usuário"""
    # Buscar todos os jogos do usuário
    games = db.query(Game).filter(Game.user_id == current_user.id).all()
    
    # Inicializar dados mensais
    evolution = [{"month": i, "points": 0} for i in range(1, 13)]
    assists = [{"month": i, "total": 0} for i in range(1, 13)]
    free_throws = [{"month": i, "total": 0} for i in range(1, 13)]
    rebounds = [{"month": i, "total": 0} for i in range(1, 13)]
    
    # Agregar estatísticas por mês
    for game in games:
        month = game.date.month
        stats = db.query(GameStats).filter(GameStats.game_id == game.id).all()
        
        for stat in stats:
            evolution[month-1]["points"] += stat.points
            assists[month-1]["total"] += stat.assists
            free_throws[month-1]["total"] += stat.free_throws
            rebounds[month-1]["total"] += stat.rebounds
    
    return {
        "evolution": evolution,
        "assists": assists,
        "free_throws": free_throws,
        "rebounds": rebounds
    }

@router.get("/me/events", response_model=List[EventBase])
async def get_profile_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retorna os eventos do usuário"""
    events = db.query(Event).filter(Event.user_id == current_user.id).all()
    return events

@router.put("/me", response_model=ProfileBase)
async def update_profile(
    profile: ProfileBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o perfil do usuário"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Atualizar campos
    user.name = profile.name
    user.email = profile.email
    user.phone = profile.phone
    user.plan = profile.plan
    
    db.commit()
    db.refresh(user)
    
    # Recalcular nível
    level, next_level, next_level_exp, current_exp, progress = calculate_user_level(user.exp)
    
    return {
        "name": user.name,
        "email": user.email,
        "phone": user.phone or "",
        "plan": user.plan or "Bronze",
        "avatar": user.avatar,
        "level": level,
        "exp": user.exp,
        "nextLevel": next_level,
        "nextLevelExp": next_level_exp,
        "currentExp": current_exp,
        "totalExp": user.exp,
        "progress": progress
    }

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de avatar do usuário"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
    
    # Criar nome único para o arquivo
    file_extension = file.filename.split(".")[-1]
    file_name = f"{current_user.id}_{datetime.now().timestamp()}.{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    # Salvar arquivo
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Atualizar avatar no banco
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Remover avatar antigo se existir
    if user.avatar:
        old_avatar = UPLOAD_DIR / user.avatar.split("/")[-1]
        if old_avatar.exists():
            old_avatar.unlink()
    
    user.avatar = f"/api/profile/avatar/{file_name}"
    db.commit()
    
    return {"avatar": user.avatar}

@router.get("/avatar/{file_name}")
async def get_avatar(file_name: str):
    """Retorna o arquivo de avatar"""
    file_path = UPLOAD_DIR / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Avatar não encontrado")
    return FileResponse(file_path) 