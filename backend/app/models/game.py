from app.models.base import Base, game_player
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    opponent = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    time = Column(String, nullable=True)
    location = Column(String, nullable=True)
    category = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default="now()")

    # Relacionamentos
    owner = relationship("User", back_populates="games")
    statistics = relationship("Statistic", back_populates="game")
    players = relationship("Player", secondary=game_player, back_populates="games") 