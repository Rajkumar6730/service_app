from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.user import User
from ..schemas.notification import NotificationResponse
from ..services import notification_service

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
    dependencies=[Depends(get_current_user)]
)

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return notification_service.get_my_notifications(db, current_user.id)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    notification = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
