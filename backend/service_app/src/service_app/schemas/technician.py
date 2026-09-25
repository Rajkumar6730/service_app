from pydantic import BaseModel
from typing import Optional

class StatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None
