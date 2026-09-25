from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str  # CUSTOMER, TECHNICIAN, MANAGER

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
