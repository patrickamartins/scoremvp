from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlayerBase(BaseModel):
    name: str
    number: int
    position: Optional[str] = None
    active: Optional[bool] = True
    categoria: Optional[str] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    number: Optional[int] = None
    position: Optional[str] = None
    active: Optional[bool] = None
    categoria: Optional[str] = None

class PlayerOut(PlayerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 