from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StatMonth(BaseModel):
    month: int
    points: Optional[int] = 0
    total: Optional[int] = 0

class UserStatsResponse(BaseModel):
    evolution: List[dict]
    assists: List[dict]
    free_throws: List[dict]
    rebounds: List[dict]
    # Adicione outros campos conforme necessário

class UserEventResponse(BaseModel):
    date: str
    status: str
    title: str 