from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.schemas.user import UserFilter, UserPagination

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def update(self, user: User, update_data: Dict[str, Any]) -> User:
        for field, value in update_data.items():
            setattr(user, field, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: int) -> bool:
        user = self.get_by_id(user_id)
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True

    def list(self, filters: UserFilter, pagination: UserPagination) -> List[User]:
        query = self.db.query(User)

        if filters.name:
            search = f"%{filters.name}%"
            query = query.filter(User.name.ilike(search))

        if filters.email:
            search = f"%{filters.email}%"
            query = query.filter(User.email.ilike(search))

        if filters.role:
            query = query.filter(User.role == filters.role)

        if filters.is_active is not None:
            query = query.filter(User.is_active == filters.is_active)

        return query.offset(pagination.skip).limit(pagination.limit).all()

    def count(self, filters: UserFilter) -> int:
        query = self.db.query(User)

        if filters.name:
            search = f"%{filters.name}%"
            query = query.filter(User.name.ilike(search))

        if filters.email:
            search = f"%{filters.email}%"
            query = query.filter(User.email.ilike(search))

        if filters.role:
            query = query.filter(User.role == filters.role)

        if filters.is_active is not None:
            query = query.filter(User.is_active == filters.is_active)

        return query.count() 