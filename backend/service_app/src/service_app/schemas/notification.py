from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    request_id: Optional[int] = None
    notification_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

