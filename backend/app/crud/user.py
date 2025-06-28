from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from app.models.user import User, UserRole, UserPlan
from app.schemas.user import UserCreate, UserUpdate, UserFilter, UserPagination
from app.core.security import get_password_hash
from app.core.email import email_service

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_users(
    db: Session,
    filters: UserFilter,
    pagination: UserPagination
) -> tuple[List[User], int]:
    query = db.query(User)

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

    total = query.count()
    users = query.order_by(desc(User.created_at))\
        .offset(pagination.skip)\
        .limit(pagination.limit)\
        .all()

    return users, total

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_active=user.is_active,
        plan=user.plan
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user.send_activation_email:
        email_service.send_notification_email(
            to_email=db_user.email,
            subject="Ativação de Conta - ScoreMVP",
            body=f"Olá {db_user.name}, sua conta foi criada com sucesso!"
        )

    return db_user

def update_user(
    db: Session,
    user_id: int,
    user_update: UserUpdate
) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user(db, user_id)
    if not db_user:
        return False

    db.delete(db_user)
    db.commit()
    return True

def update_subscription(
    db: Session,
    user_id: int,
    stripe_customer_id: str,
    stripe_subscription_id: str,
    card_last4: str,
    card_brand: str
) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    db_user.stripe_customer_id = stripe_customer_id
    db_user.stripe_subscription_id = stripe_subscription_id
    db_user.card_last4 = card_last4
    db_user.card_brand = card_brand

    db.commit()
    db.refresh(db_user)
    return db_user

def cancel_subscription(db: Session, user_id: int) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    db_user.stripe_subscription_id = None
    db_user.plan = UserPlan.FREE
    db_user.card_last4 = None
    db_user.card_brand = None
    db_user.last_payment_date = None
    db_user.next_payment_date = None

    db.commit()
    db.refresh(db_user)
    return db_user 