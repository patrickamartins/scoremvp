from pydantic import BaseModel, field_serializer
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
    created_at: Optional[datetime] = None
    user_id: Optional[int] = None
    team_id: Optional[int] = None
    user: Optional[UserOut] = None

    @field_serializer('created_at')
    def serialize_created_at(self, value: Optional[datetime]) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)

    class Config:
        from_attributes = True 