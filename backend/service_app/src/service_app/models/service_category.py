from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class ServiceCategory(Base):
    __tablename__ = 'service_categories'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    requests = relationship("ServiceRequest", back_populates="category")
