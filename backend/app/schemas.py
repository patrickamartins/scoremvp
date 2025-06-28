from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, validator, root_validator, EmailStr


# backend/app/schemas.py

# --- Usuário e Token (já existentes) ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

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

class PlayerUpdate(PlayerBase):
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    numero: Optional[int] = Field(None, ge=0, le=99)
    posicao: Optional[str] = Field(None, max_length=50)

class PlayerOut(PlayerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Game e Estatistica (se já não tiverem) ---
class GameCreate(BaseModel):
    opponent: str = Field(..., min_length=2, max_length=100)
    date: datetime = Field(default_factory=datetime.now)
    location: Optional[str] = Field(None, max_length=100)
    categoria: Optional[str] = Field(None)
    category: Optional[str] = Field(None)  # Campo alternativo para compatibilidade
    status: str = Field(default="pendente")
    jogadoras: Optional[List[int]] = Field(None)

    @validator("date")
    def validate_date(cls, v):
        # Se v não tiver timezone, assume UTC
        if v.tzinfo is None or v.tzinfo.utcoffset(v) is None:
            v = v.replace(tzinfo=timezone.utc)
        # Aceita qualquer data
        return v

    @root_validator(pre=True)
    def ensure_status_and_category(cls, values):
        try:
            # Garante status em maiúsculo
            status = values.get("status", "pendente")
            values["status"] = status.upper()
            
            # Unifica category/categoria
            category = values.get("category")
            categoria = values.get("categoria")
            if category and not categoria:
                values["categoria"] = category
            values.pop("category", None)  # Remove o campo category após processamento
            
            return values
        except Exception as e:
            print("ERRO NO ROOT VALIDATOR:", e)
            raise

class GameUpdate(BaseModel):
    opponent: Optional[str] = Field(None, min_length=2, max_length=100)
    date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, pattern="^(pendente|em_andamento|finalizado)$")

class GameOut(BaseModel):
    id: int
    opponent: str
    date: datetime
    location: Optional[str] = None
    status: str
    created_at: datetime
    players: List[PlayerOut] = []

    class Config:
        from_attributes = True

class EstatisticaCreate(BaseModel):
    jogadora_id: int
    jogo_id: int
    pontos: int = Field(default=0, ge=0)
    assistencias: int = Field(default=0, ge=0)
    rebotes: int = Field(default=0, ge=0)
    roubos: int = Field(default=0, ge=0)
    faltas: int = Field(default=0, ge=0)
    interferencia: int = Field(default=0, ge=0)
    quarto: int = Field(..., ge=1, le=4)

class EstatisticaUpdate(BaseModel):
    pontos: Optional[int] = Field(None, ge=0)
    assistencias: Optional[int] = Field(None, ge=0)
    rebotes: Optional[int] = Field(None, ge=0)
    roubos: Optional[int] = Field(None, ge=0)
    faltas: Optional[int] = Field(None, ge=0)
    interferencia: Optional[int] = Field(None, ge=0)
    quarto: Optional[int] = Field(None, ge=1, le=4)

class JogoSimples(BaseModel):
    id: int
    opponent: str
    date: datetime
    location: Optional[str] = None
    status: str
    categoria: Optional[str] = None

    class Config:
        from_attributes = True

class EstatisticaOut(EstatisticaCreate):
    id: int
    jogadora: PlayerOut
    jogo: JogoSimples

    class Config:
        from_attributes = True

class EstatisticasQuarto(BaseModel):
    quarto: int
    total_pontos: int
    total_assistencias: int
    total_rebotes: int
    total_roubos: int
    total_faltas: int

class EstatisticasResumo(BaseModel):
    total_pontos: int
    total_assistencias: int
    total_rebotes: int
    total_roubos: int
    total_faltas: int
    por_quarto: List[EstatisticasQuarto]

class LeadCreate(BaseModel):
    nome: str
    email: EmailStr
    whatsapp: str

class LeadOut(BaseModel):
    id: int
    nome: str
    email: EmailStr
    whatsapp: str
    created_at: datetime

    class Config:
        orm_mode = True

PlayerOut.update_forward_refs()
GameOut.update_forward_refs()
EstatisticaOut.update_forward_refs()

