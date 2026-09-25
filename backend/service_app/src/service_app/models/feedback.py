from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Feedback(Base):
    __tablename__ = 'feedback'
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey('service_requests.id'), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("ServiceRequest", back_populates="feedback")
    customer = relationship("User", back_populates="feedback", foreign_keys=[customer_id])
