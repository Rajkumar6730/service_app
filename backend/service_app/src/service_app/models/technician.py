from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Technician(Base):
    __tablename__ = 'technicians'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    specialization = Column(String(255))
    experience = Column(String(100))
    availability = Column(String(50), default="Available", index=True)

    user = relationship("User", back_populates="technician_profile")
    assignments = relationship("Assignment", back_populates="technician")
