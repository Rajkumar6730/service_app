from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class ServiceRequest(Base):
    __tablename__ = 'service_requests'
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey('service_categories.id'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="Medium")
    status = Column(String(50), default="Pending", index=True)
    address = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", back_populates="requests", foreign_keys=[customer_id])
    category = relationship("ServiceCategory", back_populates="requests")
    assignments = relationship("Assignment", back_populates="request")
    status_history = relationship("StatusHistory", back_populates="request")
    attachments = relationship("Attachment", back_populates="request", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="request", uselist=False)

    @property
    def customer_phone(self):
        return self.customer.phone if self.customer else None

    @property
    def technicians(self):
        result = []
        if self.status in ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED']:
            if self.assignments:
                # Use a set to avoid duplicate technician records if any exist
                seen = set()
                for assignment in self.assignments:
                    if assignment.technician and assignment.technician.user:
                        if assignment.technician.id not in seen:
                            seen.add(assignment.technician.id)
                            result.append({
                                "name": assignment.technician.user.name,
                                "phone": assignment.technician.user.phone,
                                "specialization": assignment.technician.specialization,
                                "status": getattr(assignment, 'status', 'ASSIGNED')
                            })
        return result
