from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import Base

class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    TEAM_ADMIN = "team_admin"
    SCOUT = "scout"
    PLAYER = "player"
    GUEST = "guest"

class UserPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.PLAYER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Subscription fields
    plan = Column(Enum(UserPlan), nullable=False, default=UserPlan.FREE)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    
    # Subscription fields
    last_payment_date = Column(DateTime, nullable=True)
    next_payment_date = Column(DateTime, nullable=True)
    card_last4 = Column(String, nullable=True)
    card_brand = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    
    phone = Column(String, nullable=True)
    cpf = Column(String, nullable=True)
    favorite_team = Column(String, nullable=True)
    playing_team = Column(String, nullable=True)
    
    # Relationships
    sent_notifications = relationship("Notification", back_populates="creator")
    notifications = relationship("UserNotification", back_populates="user")
    games = relationship("Game", back_populates="owner")
    # teams = relationship("Team", secondary="user_teams", back_populates="members")
    # created_teams = relationship("Team", back_populates="creator") 