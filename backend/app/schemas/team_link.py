from pydantic import BaseModel
from typing import Optional

class TeamLinkRequest(BaseModel):
    player_email: str

class TeamLinkResponse(BaseModel):
    message: str
    notification_id: Optional[int] = None

class AcceptTeamLinkRequest(BaseModel):
    notification_id: int
    accept: bool

