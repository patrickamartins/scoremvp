from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class GameCreate(BaseModel):
    opponent: str
    date: datetime
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    owner_id: Optional[int] = None
    # Adicione outros campos necessários para criação

class GameOut(BaseModel):
    id: int
    opponent: str
    date: datetime
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    status: str
    owner_id: int
    created_at: datetime
    # Adicione outros campos/relacionamentos se necessário

    class Config:
        from_attributes = True 