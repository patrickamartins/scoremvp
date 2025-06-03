from pydantic import BaseModel
from typing import List, Optional

class StatMonth(BaseModel):
    month: int
    points: Optional[int] = 0
    total: Optional[int] = 0

class UserStatsResponse(BaseModel):
    evolution: List[StatMonth]  # Pontuação por mês
    assists: List[StatMonth]
    free_throws: List[StatMonth]
    rebounds: List[StatMonth]
    # Adicione outros campos conforme necessário

class UserEventResponse(BaseModel):
    date: str  # yyyy-mm-dd
    status: str  # accepted, pending, rejected
    title: str 