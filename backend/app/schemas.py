from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator, root_validator


# backend/app/schemas.py

# --- Usuário e Token (já existentes) ---
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    email: str = Field(..., regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str


# --- Jogadora (Player) ---
class PlayerBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    numero: int = Field(..., ge=0, le=99)
    posicao: Optional[str] = Field(None, max_length=50)

class PlayerCreate(PlayerBase):
    pass


from typing import Optional

class PlayerUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    numero: Optional[int] = Field(None, ge=0, le=99)
    posicao: Optional[str] = Field(None, max_length=50)

    model_config = {"from_attributes": True}



class PlayerOut(PlayerBase):
    id: int
    estatisticas: List["EstatisticaOut"] = []

    class Config:
        orm_mode = True


# --- Game e Estatistica (se já não tiverem) ---
class GameCreate(BaseModel):
    opponent: str = Field(..., min_length=2, max_length=100)
    date: datetime = Field(default_factory=datetime.now)
    location: Optional[str] = Field(None, max_length=100)
    status: str = Field(default="pendente")

    @validator("date")
    def validate_date(cls, v):
        if v < datetime.now():
            raise ValueError("Data do jogo não pode ser no passado")
        return v

    @root_validator(pre=True)
    def ensure_status_upper(cls, values):
        status = values.get("status", "pendente")
        print("STATUS RECEBIDO NO Pydantic:", status)
        values["status"] = status.upper()
        return values

class GameUpdate(BaseModel):
    opponent: Optional[str] = Field(None, min_length=2, max_length=100)
    date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, regex="^(pendente|em_andamento|finalizado)$")

class GameOut(BaseModel):
    id: int
    opponent: str
    date: datetime
    location: Optional[str] = None
    status: str
    created_at: datetime
    estatisticas: List["EstatisticaOut"] = []

    class Config:
        orm_mode = True

class EstatisticaCreate(BaseModel):
    jogadora_id: int
    jogo_id: int
    pontos: int = Field(default=0, ge=0)
    assistencias: int = Field(default=0, ge=0)
    rebotes: int = Field(default=0, ge=0)
    roubos: int = Field(default=0, ge=0)
    faltas: int = Field(default=0, ge=0)
    quarto: int = Field(..., ge=1, le=4)

class EstatisticaUpdate(BaseModel):
    pontos: Optional[int] = Field(None, ge=0)
    assistencias: Optional[int] = Field(None, ge=0)
    rebotes: Optional[int] = Field(None, ge=0)
    roubos: Optional[int] = Field(None, ge=0)
    faltas: Optional[int] = Field(None, ge=0)
    quarto: Optional[int] = Field(None, ge=1, le=4)

class EstatisticaOut(EstatisticaCreate):
    id: int
    jogadora: PlayerOut
    jogo: GameOut

    model_config = {"from_attributes": True}

PlayerOut.update_forward_refs()
GameOut.update_forward_refs()
EstatisticaOut.update_forward_refs()

