from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.models.base import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False)
    telefone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow) 