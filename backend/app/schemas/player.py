from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlayerBase(BaseModel):
    nome: str
    numero: int
    posicao: Optional[str] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    nome: Optional[str] = None
    numero: Optional[int] = None
    posicao: Optional[str] = None

class PlayerOut(PlayerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 