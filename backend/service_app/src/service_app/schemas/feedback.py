from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

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
