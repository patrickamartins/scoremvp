from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from datetime import datetime

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    telefone = Column(String, nullable=True)
    mensagem = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow) 