from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..models.notification import Notification
from ..models.user import User

def create_notification(db: Session, user_id: int, title: str, message: str):
    new_notification = Notification(
        user_id=user_id,
        title=title,
        message=message
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

def get_my_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(desc(Notification.created_at)).all()

def mark_as_read(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        
    return notification

def notify_all_managers(db: Session, title: str, message: str):
    managers = db.query(User).filter(User.role == 'MANAGER').all()
    for manager in managers:
        create_notification(db, manager.id, title, message)
