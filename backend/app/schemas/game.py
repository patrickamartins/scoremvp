from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.player import PlayerOut

class GameCreate(BaseModel):
    opponent: str
    date: datetime
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    owner_id: Optional[int] = None
    # Adicione outros campos necessários para criação

class GameUpdate(BaseModel):
    opponent: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    owner_id: Optional[int] = None
    players: Optional[List[int]] = None
    # Adicione outros campos necessários para atualização

class GameOut(BaseModel):
    id: int
    opponent: str
    date: datetime
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    status: str
    owner_id: Optional[int] = None
    created_at: datetime
    players: List[PlayerOut] = []
    # Adicione outros campos/relacionamentos se necessário

    class Config:
        from_attributes = True 