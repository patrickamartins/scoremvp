from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserPlan

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False

class UserCreate(UserBase):
    password: str
    cpf: str = Field(..., min_length=11, max_length=11)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserResponse(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

class UserListResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    plan: UserPlan
    is_active: bool
    created_at: datetime
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True

class UserSearchParams(BaseModel):
    search: Optional[str] = None
    role: Optional[UserRole] = None
    plan: Optional[UserPlan] = None
    is_active: Optional[bool] = None
    skip: int = 0
    limit: int = 10 