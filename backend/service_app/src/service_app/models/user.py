from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20))
    role = Column(String(50), nullable=False, index=True) # e.g. CUSTOMER, MANAGER, TECHNICIAN
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('unique_manager_idx', 'role', unique=True, sqlite_where=(Column('role') == 'MANAGER')),
    )

    requests = relationship("ServiceRequest", back_populates="customer", foreign_keys="[ServiceRequest.customer_id]")
    technician_profile = relationship("Technician", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    feedback = relationship("Feedback", back_populates="customer", foreign_keys="[Feedback.customer_id]")
