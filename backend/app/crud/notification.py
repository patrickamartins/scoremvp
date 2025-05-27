from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.notification import Notification, UserNotification, NotificationTarget
from app.models.user import User
from app.schemas.notification import NotificationCreate

def create_notification(db: Session, notification: NotificationCreate, creator_id: int) -> Notification:
    db_notification = Notification(
        content=notification.content,
        url=notification.url,
        target=notification.target,
        created_by=creator_id
    )
    db.add(db_notification)
    db.flush()  # Para obter o ID da notificação

    # Criar notificações para os usuários alvo
    users = db.query(User)
    if notification.target == NotificationTarget.PLAYERS:
        users = users.filter(User.role == "player")
    elif notification.target == NotificationTarget.MVP:
        users = users.filter(User.role == "mvp")
    elif notification.target == NotificationTarget.TEAM:
        users = users.filter(User.role == "team")

    for user in users.all():
        user_notification = UserNotification(
            user_id=user.id,
            notification_id=db_notification.id
        )
        db.add(user_notification)

    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_user_notifications(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100,
    unread_only: bool = False
) -> List[UserNotification]:
    query = db.query(UserNotification).filter(UserNotification.user_id == user_id)
    
    if unread_only:
        query = query.filter(UserNotification.is_read == False)
    
    return query.order_by(desc(UserNotification.created_at)).offset(skip).limit(limit).all()

def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Optional[UserNotification]:
    user_notification = db.query(UserNotification).filter(
        UserNotification.id == notification_id,
        UserNotification.user_id == user_id
    ).first()
    
    if user_notification:
        user_notification.is_read = True
        db.commit()
        db.refresh(user_notification)
    
    return user_notification

def get_notification_log(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[Notification]:
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    return db.query(Notification)\
        .filter(Notification.created_at >= thirty_days_ago)\
        .order_by(desc(Notification.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(UserNotification)\
        .filter(
            UserNotification.user_id == user_id,
            UserNotification.is_read == False
        ).count() 