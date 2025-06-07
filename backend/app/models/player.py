from app.models.base import Base, game_player
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    number = Column(Integer, nullable=True)
    position = Column(String, nullable=True)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, server_default="now()")

    # Relacionamentos
    games = relationship("Game", secondary=game_player, back_populates="players")
    statistics = relationship("Statistic", back_populates="player") 