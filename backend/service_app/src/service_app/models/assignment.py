from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Assignment(Base):
    __tablename__ = 'assignments'
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey('service_requests.id'), nullable=False, index=True)
    technician_id = Column(Integer, ForeignKey('technicians.id'), nullable=False, index=True)
    assigned_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="ASSIGNED")

    request = relationship("ServiceRequest", back_populates="assignments")
    technician = relationship("Technician", back_populates="assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])
