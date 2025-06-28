"""
Models package for the application.
This package contains all SQLAlchemy models.
"""

from app.models.base import Base
from app.models.user import User, UserRole, UserPlan
from app.models.game import Game
from app.models.player import Player
from app.models.statistic import Statistic
from app.models.lead import Lead
from app.models.notification import Notification, UserNotification, NotificationTarget

# Para garantir que o Alembic detecte todos os modelos
__all__ = [
    "Base",
    "User",
    "UserRole",
    "UserPlan",
    "Game",
    "Player",
    "Statistic",
    "Lead",
    "Notification",
    "UserNotification",
    "NotificationTarget"
] 