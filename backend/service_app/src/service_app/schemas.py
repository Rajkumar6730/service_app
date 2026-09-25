from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .models import RoleEnum, RequestStatus, RequestPriority

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[RoleEnum] = RoleEnum.CUSTOMER

class UserResponse(UserBase):
    id: int
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True

# --- Address Schemas ---
class AddressBase(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Service Category Schemas ---
class ServiceCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryResponse(ServiceCategoryBase):
    id: int

    class Config:
        from_attributes = True

# --- Service Request Schemas ---
class ServiceRequestBase(BaseModel):
    title: str
    description: str
    category_id: int
    priority: Optional[RequestPriority] = RequestPriority.MEDIUM
    image_url: Optional[str] = None

class ServiceRequestCreate(ServiceRequestBase):
    pass

class ServiceRequestUpdateStatus(BaseModel):
    status: RequestStatus
    technician_id: Optional[int] = None

class ServiceRequestResponse(ServiceRequestBase):
    id: int
    status: RequestStatus
    customer_id: int
    technician_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Service Note Schemas ---
class ServiceNoteBase(BaseModel):
    note_text: str

class ServiceNoteCreate(ServiceNoteBase):
    pass

class ServiceNoteResponse(ServiceNoteBase):
    id: int
    request_id: int
    technician_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Feedback Schemas ---
class FeedbackBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: int
    request_id: int
    customer_id: int
    created_at: datetime

    class Config:
        from_attributes = True
