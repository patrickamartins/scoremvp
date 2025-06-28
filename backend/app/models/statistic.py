from app.models.base import Base
from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class Statistic(Base):
    __tablename__ = "statistics"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    points = Column(Integer, default=0)
    rebounds = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    steals = Column(Integer, default=0)
    blocks = Column(Integer, default=0)
    fouls = Column(Integer, default=0)
    minutes_played = Column(Float, default=0.0)
    quarter = Column(Integer, nullable=True)
    two_attempts = Column(Integer, default=0)
    two_made = Column(Integer, default=0)
    three_attempts = Column(Integer, default=0)
    three_made = Column(Integer, default=0)
    free_throw_attempts = Column(Integer, default=0)
    free_throw_made = Column(Integer, default=0)
    interference = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    game = relationship("Game", back_populates="statistics")
    player = relationship("Player", back_populates="statistics") 