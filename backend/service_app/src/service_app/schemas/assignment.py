from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import UserResponse
from .manager import TechnicianResponse

class AssignmentCreate(BaseModel):
    request_id: int
    technician_ids: list[int]

class AssignmentResponse(BaseModel):
    id: int
    request_id: int
    technician_id: int
    assigned_by: int
    assigned_at: datetime
    status: str
    
    technician: Optional[TechnicianResponse] = None

    class Config:
        from_attributes = True
