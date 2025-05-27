from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(enum.Enum):
    ADMIN = "admin"
    PLAYER = "player"
    COACH = "coach"
    ANALYST = "analyst"
    TEAM = "team"

class UserPlan(enum.Enum):
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
    
    # Campos de assinatura
    plan = Column(Enum(UserPlan), nullable=False, default=UserPlan.FREE)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    last_payment_date = Column(DateTime, nullable=True)
    next_payment_date = Column(DateTime, nullable=True)
    card_last4 = Column(String, nullable=True)
    card_brand = Column(String, nullable=True)
    
    # Relacionamentos
    sent_notifications = relationship("Notification", back_populates="creator")
    notifications = relationship("UserNotification", back_populates="user") 