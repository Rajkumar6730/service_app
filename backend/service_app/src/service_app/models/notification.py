from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Notification(Base):
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    request_id = Column(Integer, ForeignKey('service_requests.id'), nullable=True)
    notification_type = Column(String(50), default="GENERAL", nullable=True)

    user = relationship("User", back_populates="notifications")
