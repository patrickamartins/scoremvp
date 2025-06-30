from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LeadBase(BaseModel):
    nome: str
    email: EmailStr
    whatsapp: str  # Mantém whatsapp no schema para compatibilidade com frontend

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 