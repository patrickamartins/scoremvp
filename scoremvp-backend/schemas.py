# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    plan: str
    team_play: Optional[str] = None
    team_fan: Optional[str] = None
    bio: Optional[str] = None
    social_links: Optional[list[str]] = None
    created_at: datetime

    class Config:
        orm_mode = True
