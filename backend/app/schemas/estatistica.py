from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EstatisticaBase(BaseModel):
    pontos: int
    assistencias: int
    rebotes: int
    roubos: int
    faltas: int
    dois_tentativas: int
    dois_acertos: int
    tres_tentativas: int
    tres_acertos: int
    lance_tentativas: int
    lance_acertos: int
    interferencia: int

class EstatisticaCreate(EstatisticaBase):
    jogadora_id: int
    jogo_id: int

class EstatisticaUpdate(BaseModel):
    pontos: Optional[int] = None
    assistencias: Optional[int] = None
    rebotes: Optional[int] = None
    roubos: Optional[int] = None
    faltas: Optional[int] = None
    dois_tentativas: Optional[int] = None
    dois_acertos: Optional[int] = None
    tres_tentativas: Optional[int] = None
    tres_acertos: Optional[int] = None
    lance_tentativas: Optional[int] = None
    lance_acertos: Optional[int] = None
    interferencia: Optional[int] = None

class EstatisticaOut(EstatisticaBase):
    id: int
    jogadora_id: int
    jogo_id: int
    created_at: datetime

    class Config:
        from_attributes = True 