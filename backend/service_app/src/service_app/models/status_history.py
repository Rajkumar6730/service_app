from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class StatusHistory(Base):
    __tablename__ = 'status_history'
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey('service_requests.id'), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    changed_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("ServiceRequest", back_populates="status_history")
    changer = relationship("User", foreign_keys=[changed_by])
