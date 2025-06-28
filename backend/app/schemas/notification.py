from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional
from app.models.notification import NotificationTarget

class NotificationBase(BaseModel):
    content: str
    url: Optional[str] = None
    target: NotificationTarget

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class UserNotificationResponse(BaseModel):
    id: int
    notification: NotificationResponse
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationLogResponse(BaseModel):
    id: int
    content: str
    url: Optional[str]
    target: NotificationTarget
    created_at: datetime
    created_by: int
    creator_name: str

    class Config:
        from_attributes = True 