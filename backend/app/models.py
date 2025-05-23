from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, func, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class GameStatus(str, enum.Enum):
    PENDENTE = "PENDENTE"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    FINALIZADO = "FINALIZADO"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(32), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jogos = relationship("Jogo", back_populates="owner")

class Jogadora(Base):
    __tablename__ = "jogadoras"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), index=True, nullable=False)
    numero = Column(Integer, nullable=False)
    posicao = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    estatisticas = relationship("Estatistica", back_populates="jogadora")

class Jogo(Base):
    __tablename__ = "jogos"

    id = Column(Integer, primary_key=True, index=True)
    opponent = Column(String(100), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(100))
    status = Column(Enum('PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO', name='gamestatus'), nullable=False, default='PENDENTE')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="jogos")
    estatisticas = relationship("Estatistica", back_populates="jogo")

class Estatistica(Base):
    __tablename__ = "estatisticas"

    id = Column(Integer, primary_key=True, index=True)
    jogadora_id = Column(Integer, ForeignKey("jogadoras.id"), nullable=False)
    jogo_id = Column(Integer, ForeignKey("jogos.id"), nullable=False)
    pontos = Column(Integer, default=0)
    assistencias = Column(Integer, default=0)
    rebotes = Column(Integer, default=0)
    roubos = Column(Integer, default=0)
    faltas = Column(Integer, default=0)
    quarto = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jogadora = relationship("Jogadora", back_populates="estatisticas")
    jogo = relationship("Jogo", back_populates="estatisticas")
