# models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base   # garanta que é o mesmo Base de database.py

# models.py
class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(100), nullable=False)
    email          = Column(String(100), unique=True, index=True, nullable=False)
    password_hash  = Column(String(128), nullable=False)

    # camelCase direto
    document       = Column(String(20), nullable=False)
    documentType   = Column("document_type", String(10), nullable=False)

    teamPlay       = Column("team_play", String(100), nullable=True)
    teamFan        = Column("team_fan",  String(100), nullable=True)
    plan           = Column(String(20), default="free")
    created_at     = Column(DateTime, default=datetime.utcnow)

class Jogadora(Base):
    __tablename__ = "jogadoras"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    estatisticas = relationship("Estatistica", back_populates="jogadora")

class Jogo(Base):
    __tablename__ = "jogos"

    id = Column(Integer, primary_key=True, index=True)
    data = Column(DateTime, nullable=False)
    local = Column(String(100), nullable=False)
    horario = Column(String(10), nullable=False)
    adversario = Column(String(100), nullable=False)
    categoria = Column(String(50), nullable=False)
    estatisticas = relationship("Estatistica", back_populates="jogo")

class Estatistica(Base):
    __tablename__ = "estatisticas"

    id = Column(Integer, primary_key=True, index=True)
    id_jogadora = Column(Integer, ForeignKey("jogadoras.id"), nullable=False)
    id_jogo = Column(Integer, ForeignKey("jogos.id"), nullable=False)
    tipo = Column(Enum('ponto_2', 'ponto_3', 'lance_livre', 'assistencia', 
                      'rebote', 'roubo', 'toco', 'turnover', 'falta'), 
                 nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    jogadora = relationship("Jogadora", back_populates="estatisticas")
    jogo = relationship("Jogo", back_populates="estatisticas")

class Acao(Base):
    __tablename__ = "acoes"

    id = Column(Integer, primary_key=True, index=True)
    id_estatistica = Column(Integer, ForeignKey("estatisticas.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    estatistica = relationship("Estatistica")

