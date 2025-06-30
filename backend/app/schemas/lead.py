from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class LeadBase(BaseModel):
    nome: str
    email: EmailStr
    whatsapp: str  # Mantém whatsapp no schema para compatibilidade com frontend

class LeadCreate(LeadBase):
    pass

class Lead(BaseModel):
    id: int
    nome: str
    email: EmailStr
    telefone: str  # Campo do banco
    created_at: datetime

    class Config:
        from_attributes = True 