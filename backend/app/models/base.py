"""
Base models package for the application.
This package contains all SQLAlchemy models and their relationships.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Float, Boolean, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

# Tabela de associação entre jogos e jogadoras
game_player = Table(
    'game_player',
    Base.metadata,
    Column('game_id', Integer, ForeignKey('games.id')),
    Column('player_id', Integer, ForeignKey('players.id'))
)

# Enums
class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    TEAM_ADMIN = "team_admin"
    SCOUT = "scout"
    PLAYER = "player"
    GUEST = "guest"

class UserPlan(enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"

class NotificationTarget(enum.Enum):
    ALL = "all"
    PLAYERS = "players"
    MVP = "mvp"
    TEAM = "team" 