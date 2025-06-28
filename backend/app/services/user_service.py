from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User, UserRole, UserPlan
from app.schemas.user import UserCreate, UserUpdate, UserFilter, UserPagination
from app.core.security import get_password_hash, verify_password
from app.repositories.user_repository import UserRepository

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = UserRepository(db)

    def create_user(self, user_data: UserCreate) -> User:
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
            role=user_data.role,
            plan=user_data.plan,
            is_active=user_data.is_active,
            profile_image=user_data.profile_image
        )
        return self.repository.create(db_user)

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.repository.get_by_id(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.repository.get_by_email(email)

    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        db_user = self.get_user_by_id(user_id)
        if not db_user:
            return None

        update_data = user_data.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

        return self.repository.update(db_user, update_data)

    def delete_user(self, user_id: int) -> bool:
        return self.repository.delete(user_id)

    def list_users(self, filters: UserFilter, pagination: UserPagination) -> List[User]:
        return self.repository.list(filters, pagination)

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        if not verify_password(current_password, user.hashed_password):
            return False
        
        hashed_password = get_password_hash(new_password)
        self.repository.update(user, {"hashed_password": hashed_password})
        return True

    def update_subscription(self, user_id: int, plan: UserPlan, stripe_data: dict) -> Optional[User]:
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        update_data = {
            "plan": plan,
            "stripe_customer_id": stripe_data.get("customer_id"),
            "stripe_subscription_id": stripe_data.get("subscription_id"),
            "last_payment_date": stripe_data.get("last_payment_date"),
            "next_payment_date": stripe_data.get("next_payment_date"),
            "card_last4": stripe_data.get("card_last4"),
            "card_brand": stripe_data.get("card_brand")
        }

        return self.repository.update(user, update_data) 