from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import UserRole, UserPlan

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool = True
    plan: UserPlan = UserPlan.FREE

class UserCreate(UserBase):
    password: str
    send_activation_email: bool = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    plan: Optional[UserPlan] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    last_payment_date: Optional[datetime] = None
    next_payment_date: Optional[datetime] = None
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    plan: UserPlan
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserSearchParams(BaseModel):
    search: Optional[str] = None
    role: Optional[UserRole] = None
    plan: Optional[UserPlan] = None
    is_active: Optional[bool] = None
    skip: int = 0
    limit: int = 10 