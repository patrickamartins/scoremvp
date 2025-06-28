from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, UserPlan

class UserBase(BaseModel):
    email: EmailStr
    name: str
    is_active: Optional[bool] = True
    role: Optional[UserRole] = UserRole.PLAYER
    plan: Optional[UserPlan] = UserPlan.FREE
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    favorite_team: Optional[str] = None
    playing_team: Optional[str] = None

    @field_validator('name')
    def name_must_not_be_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip() if v else v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    send_activation_email: Optional[bool] = False

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    plan: Optional[UserPlan] = None
    is_active: Optional[bool] = None
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    favorite_team: Optional[str] = None
    playing_team: Optional[str] = None

    @field_validator('name')
    def name_must_not_be_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip() if v else v

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    last_payment_date: Optional[datetime] = None
    next_payment_date: Optional[datetime] = None
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    favorite_team: Optional[str] = None
    playing_team: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

class UserListResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserFilter(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserPagination(BaseModel):
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=10, ge=1, le=100)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None 