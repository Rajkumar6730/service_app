from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    MANAGER = "MANAGER"
    TECHNICIAN = "TECHNICIAN"

class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class RequestPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.CUSTOMER, nullable=False)
    phone_number = Column(String(20), nullable=True)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    addresses = relationship("Address", back_populates="user")
    customer_requests = relationship("ServiceRequest", foreign_keys="[ServiceRequest.customer_id]", back_populates="customer")
    technician_requests = relationship("ServiceRequest", foreign_keys="[ServiceRequest.technician_id]", back_populates="technician")
    notes = relationship("ServiceNote", back_populates="technician")
    feedback = relationship("Feedback", back_populates="customer")

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    zip_code = Column(String(20), nullable=False)

    user = relationship("User", back_populates="addresses")

class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)

    requests = relationship("ServiceRequest", back_populates="category")

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING)
    priority = Column(Enum(RequestPriority), default=RequestPriority.MEDIUM)
    image_url = Column(String(500), nullable=True)
    
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", foreign_keys=[customer_id], back_populates="customer_requests")
    technician = relationship("User", foreign_keys=[technician_id], back_populates="technician_requests")
    category = relationship("ServiceCategory", back_populates="requests")
    notes = relationship("ServiceNote", back_populates="request")
    feedback = relationship("Feedback", back_populates="request", uselist=False)

class ServiceNote(Base):
    __tablename__ = "service_notes"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("ServiceRequest", back_populates="notes")
    technician = relationship("User", back_populates="notes")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False, unique=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # e.g. 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("ServiceRequest", back_populates="feedback")
    customer = relationship("User", back_populates="feedback")
