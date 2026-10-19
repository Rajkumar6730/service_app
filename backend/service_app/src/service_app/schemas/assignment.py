from pydantic import BaseModel, model_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from .user import UserResponse
from .manager import TechnicianResponse

class AssignmentCreate(BaseModel):
    request_id: int
    technician_ids: Optional[List[int]] = None
    technician_id: Optional[int] = None

    @model_validator(mode='after')
    def validate_tech_ids(self):
        if not self.technician_ids:
            if self.technician_id is not None:
                self.technician_ids = [self.technician_id]
            else:
                self.technician_ids = []
        return self

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
