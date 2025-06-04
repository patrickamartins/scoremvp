from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LeadBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    mensagem: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadOut(LeadBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 