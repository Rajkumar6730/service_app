from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.user import User
from ..models.attachment import Attachment
from ..models.assignment import Assignment

router = APIRouter(
    prefix="/attachments",
    tags=["Attachments"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/{attachment_id}/download")
def download_attachment(
    attachment_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    request = attachment.request
    
    # Security Check
    if current_user.role == "CUSTOMER":
        if request.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this attachment")
    elif current_user.role == "TECHNICIAN":
        assignment = db.query(Assignment).filter(
            Assignment.request_id == request.id,
            Assignment.technician.has(user_id=current_user.id)
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this request")
    # Managers have full access

    if not os.path.exists(attachment.file_path):
        raise HTTPException(status_code=404, detail="File has been deleted or moved")

    return FileResponse(
        path=attachment.file_path, 
        filename=attachment.filename, 
        media_type=attachment.content_type
    )
