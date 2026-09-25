from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .user import UserResponse
from .service_request import ServiceRequestResponse

# Category Schemas
class ServiceCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryResponse(ServiceCategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Request Priority Update Schema
class PriorityUpdate(BaseModel):
    priority: str

# Technician Profile Schema
class TechnicianCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    specialization: Optional[str] = None
    experience: Optional[str] = None
    availability: Optional[str] = "Available"

class TechnicianResponse(BaseModel):
    id: int
    user_id: int
    specialization: Optional[str]
    experience: Optional[str]
    availability: str
    user: UserResponse

    class Config:
        from_attributes = True
