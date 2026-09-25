from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from .feedback import FeedbackResponse

class AttachmentResponse(BaseModel):
    id: int
    filename: str
    content_type: str
    file_size: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StatusHistoryResponse(BaseModel):
    id: int
    status: str
    remarks: Optional[str] = None
    created_at: datetime
    changed_by: int

    model_config = ConfigDict(from_attributes=True)

class ServiceRequestBase(BaseModel):
    category_id: int
    title: str
    description: str
    priority: str = "MEDIUM"
    address: str

class ServiceRequestCreate(ServiceRequestBase):
    pass

class ServiceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    priority: Optional[str] = None
    address: Optional[str] = None

class AssignedTechnician(BaseModel):
    name: str
    phone: Optional[str] = None
    specialization: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class ServiceRequestResponse(ServiceRequestBase):
    id: int
    customer_id: int
    customer_phone: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
    attachments: List[AttachmentResponse] = []
    status_history: List[StatusHistoryResponse] = []
    feedback: Optional[FeedbackResponse] = None
    technicians: List[AssignedTechnician] = []

    model_config = ConfigDict(from_attributes=True)
