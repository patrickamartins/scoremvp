from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Tabela de associação entre jogos e jogadoras
jogo_jogadora = Table(
    'jogo_jogadora',
    Base.metadata,
    Column('jogo_id', Integer, ForeignKey('jogos.id')),
    Column('jogadora_id', Integer, ForeignKey('jogadoras.id'))
)

class Jogo(Base):
    __tablename__ = "jogos"

    id = Column(Integer, primary_key=True, index=True)
    opponent = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    time = Column(String, nullable=True)
    location = Column(String, nullable=True)
    categoria = Column(String, nullable=True)
    status = Column(String, default="PENDENTE")
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default="now()")

    # Relacionamentos
    owner = relationship("User", back_populates="jogos")
    estatisticas = relationship("Estatistica", back_populates="jogo")
    jogadoras = relationship("Jogadora", secondary=jogo_jogadora, back_populates="jogos") 