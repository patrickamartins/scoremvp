from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StatisticBase(BaseModel):
    points: int
    assists: int
    rebounds: int
    steals: int
    blocks: int
    turnovers: int  # Turnovers (erros)
    rebo_ofensivo: int  # Rebotes ofensivos
    rebo_defensivo: int  # Rebotes defensivos
    fr: int  # Faltas recebidas
    fp: int  # Faltas pessoais
    fouls: int
    two_attempts: int
    two_made: int
    three_attempts: int
    three_made: int
    free_throw_attempts: int
    free_throw_made: int
    interference: int

class StatisticCreate(StatisticBase):
    player_id: int
    game_id: int
    quarter: int

class StatisticUpdate(BaseModel):
    points: Optional[int] = None
    assists: Optional[int] = None
    rebounds: Optional[int] = None
    steals: Optional[int] = None
    blocks: Optional[int] = None
    turnovers: Optional[int] = None
    rebo_ofensivo: Optional[int] = None
    rebo_defensivo: Optional[int] = None
    fr: Optional[int] = None
    fp: Optional[int] = None
    fouls: Optional[int] = None
    two_attempts: Optional[int] = None
    two_made: Optional[int] = None
    three_attempts: Optional[int] = None
    three_made: Optional[int] = None
    free_throw_attempts: Optional[int] = None
    free_throw_made: Optional[int] = None
    interference: Optional[int] = None

class StatisticOut(StatisticBase):
    id: int
    player_id: int
    game_id: int
    quarter: int
    created_at: datetime

    class Config:
        from_attributes = True

class StatisticsSummary(BaseModel):
    total_points: int
    total_assists: int
    total_rebounds: int
    # Add other summary fields as needed 