from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, func, Enum, Table
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Tabela de associação entre jogos e jogadoras
jogo_jogadora = Table(
    'jogo_jogadora',
    Base.metadata,
    Column('jogo_id', Integer, ForeignKey('jogos.id'), primary_key=True),
    Column('jogadora_id', Integer, ForeignKey('jogadoras.id'), primary_key=True)
)

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
    nivel = Column(String(16), nullable=False, default="PLAYER")

    jogos = relationship("Jogo", back_populates="owner")

class Jogadora(Base):
    __tablename__ = "jogadoras"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), index=True, nullable=False)
    numero = Column(Integer, nullable=False)
    posicao = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    estatisticas = relationship("Estatistica", back_populates="jogadora")
    jogos = relationship("Jogo", secondary=jogo_jogadora, back_populates="jogadoras")

class Jogo(Base):
    __tablename__ = "jogos"

    id = Column(Integer, primary_key=True, index=True)
    opponent = Column(String(100), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(100))
    categoria = Column(String(50), nullable=True)
    status = Column(Enum('PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO', name='gamestatus'), nullable=False, default='PENDENTE')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    time = Column(String(100), nullable=True)

    owner = relationship("User", back_populates="jogos")
    estatisticas = relationship("Estatistica", back_populates="jogo")
    jogadoras = relationship("Jogadora", secondary=jogo_jogadora, back_populates="jogos")

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
    interferencia = Column(Integer, default=0)
    quarto = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jogadora = relationship("Jogadora", back_populates="estatisticas")
    jogo = relationship("Jogo", back_populates="estatisticas")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(128), nullable=False, index=True)
    whatsapp = Column(String(32), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
