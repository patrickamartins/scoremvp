from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserOut

class PlayerBase(BaseModel):
    name: str
    number: Optional[int] = None
    position: Optional[str] = None
    categoria: Optional[str] = None
    active: Optional[bool] = True

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
    created_at: Optional[str]
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True 