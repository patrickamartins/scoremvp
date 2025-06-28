from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, func, Enum, Table
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Tabela de associacao entre jogos e jogadoras
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

    statistics = relationship("Statistic", back_populates="player")
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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    owner = relationship("User", back_populates="jogos")
    statistics = relationship("Statistic", back_populates="game")
    jogadoras = relationship("Jogadora", secondary=jogo_jogadora, back_populates="jogos")

class Statistic(Base):
    __tablename__ = "statistics"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("jogadoras.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("jogos.id"), nullable=False)
    points = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    rebounds = Column(Integer, default=0)
    steals = Column(Integer, default=0)
    fouls = Column(Integer, default=0)
    interference = Column(Integer, default=0)
    quarter = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    player = relationship("Jogadora", back_populates="statistics")
    game = relationship("Jogo", back_populates="statistics")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(128), nullable=False, index=True)
    whatsapp = Column(String(32), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
