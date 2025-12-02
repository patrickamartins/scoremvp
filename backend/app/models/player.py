from app.models.base import Base, game_player
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    number = Column(Integer, nullable=True)
    position = Column(String, nullable=True)
    categoria = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default="now()")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # ID do usuário team_admin que gerencia este jogador

    # Relacionamentos
    user = relationship("User", back_populates="player_profile", uselist=False, foreign_keys=[user_id])
    team = relationship("User", foreign_keys=[team_id])  # Relacionamento com o time (team_admin)
    games = relationship("Game", secondary=game_player, back_populates="players")
    statistics = relationship("Statistic", back_populates="player") 