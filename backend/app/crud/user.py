from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from app.models.user import User, UserRole, UserPlan
from app.schemas.user import UserCreate, UserUpdate, UserSearchParams
from app.core.security import get_password_hash
from app.core.email import send_activation_email

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_users(
    db: Session,
    params: UserSearchParams
) -> tuple[List[User], int]:
    query = db.query(User)

    if params.search:
        search = f"%{params.search}%"
        query = query.filter(
            or_(
                User.name.ilike(search),
                User.email.ilike(search)
            )
        )

    if params.role:
        query = query.filter(User.role == params.role)

    if params.plan:
        query = query.filter(User.plan == params.plan)

    if params.is_active is not None:
        query = query.filter(User.is_active == params.is_active)

    total = query.count()
    users = query.order_by(desc(User.created_at))\
        .offset(params.skip)\
        .limit(params.limit)\
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
        send_activation_email(db_user)

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