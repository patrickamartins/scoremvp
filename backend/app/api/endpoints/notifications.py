from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.crud import notification as crud
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    UserNotificationResponse,
    NotificationLogResponse
)
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=NotificationResponse)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    Criar uma nova notificação (apenas admin).
    """
    return crud.create_notification(db=db, notification=notification, creator_id=current_user.id)

@router.get("/me", response_model=List[UserNotificationResponse])
def get_my_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Obter notificações do usuário atual.
    """
    return crud.get_user_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )

@router.get("/me/unread/count")
def get_unread_count(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Obter contagem de notificações não lidas do usuário atual.
    """
    return {"count": crud.get_unread_count(db=db, user_id=current_user.id)}

@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Marcar uma notificação como lida.
    """
    notification = crud.mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return {"message": "Notification marked as read"}

@router.get("/log", response_model=List[NotificationLogResponse])
def get_notification_log(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Obter log de notificações enviadas (apenas admin).
    """
    notifications = crud.get_notification_log(db=db, skip=skip, limit=limit)
    return [
        NotificationLogResponse(
            **notification.__dict__,
            creator_name=notification.creator.name
        )
        for notification in notifications
    ] 