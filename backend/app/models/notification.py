from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class NotificationTarget(enum.Enum):
    ALL = "all"
    PLAYERS = "players"
    MVP = "mvp"
    TEAM = "team"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(250), nullable=False)
    url = Column(String(255), nullable=True)
    target = Column(Enum(NotificationTarget), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relacionamentos
    creator = relationship("User", back_populates="sent_notifications")
    user_notifications = relationship("UserNotification", back_populates="notification")

class UserNotification(Base):
    __tablename__ = "user_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_id = Column(Integer, ForeignKey("notifications.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="notifications")
    notification = relationship("Notification", back_populates="user_notifications") 