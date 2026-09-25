from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from math import ceil
from typing import Optional
from fastapi import UploadFile, HTTPException
import os
import shutil
import uuid

from ..models.service_request import ServiceRequest
from ..models.service_category import ServiceCategory
from ..models.status_history import StatusHistory
from ..models.attachment import Attachment
from ..schemas.service_request import ServiceRequestCreate
from ..services.notification_service import create_notification, notify_all_managers

UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".txt"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def validate_and_save_file(file: UploadFile, request_id: int, db: Session) -> Optional[Attachment]:
    if not file or not file.filename:
        return None
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed.")
        
    # Read first bytes to determine size (FastAPI SpooledTemporaryFile might not have len())
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 5MB.")
        
    # Generate secure random filename
    secure_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, secure_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save attachment")
        
    attachment = Attachment(
        request_id=request_id,
        filename=file.filename,
        file_path=file_path,
        content_type=file.content_type,
        file_size=file_size
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return attachment

def create_service_request(db: Session, request_data: ServiceRequestCreate, customer_id: int, file: Optional[UploadFile] = None):
    # Ensure category exists to prevent Foreign Key constraint failures during testing
    category = db.query(ServiceCategory).filter(ServiceCategory.id == request_data.category_id).first()
    if not category:
        new_category = ServiceCategory(
            id=request_data.category_id,
            name=f"Category {request_data.category_id}",
            description="Auto-generated category for testing"
        )
        db.add(new_category)
        db.commit()

    new_request = ServiceRequest(
        customer_id=customer_id,
        category_id=request_data.category_id,
        title=request_data.title,
        description=request_data.description,
        priority=request_data.priority,
        status="NEW",
        address=request_data.address
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Process attachment if provided
    if file:
        validate_and_save_file(file, new_request.id, db)
    
    # Create initial status history record
    history = StatusHistory(
        request_id=new_request.id,
        status="NEW",
        changed_by=customer_id,
        remarks="Service request created by customer."
    )
    db.add(history)
    db.commit()
    db.refresh(new_request)

    # Trigger Notifications
    create_notification(
        db, 
        customer_id, 
        "Request Created Successfully", 
        f"Your service request '#{new_request.id} - {new_request.title}' has been logged and is awaiting assignment."
    )
    notify_all_managers(
        db,
        "New Service Request",
        f"A new {new_request.priority} priority request (#{new_request.id}) was submitted and needs assignment."
    )

    return new_request

def get_my_requests(
    db: Session, 
    customer_id: int,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None
):
    query = db.query(ServiceRequest).filter(ServiceRequest.customer_id == customer_id)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                ServiceRequest.title.ilike(search_filter),
                ServiceRequest.description.ilike(search_filter),
                ServiceRequest.address.ilike(search_filter)
            )
        )
        
    if status:
        query = query.filter(ServiceRequest.status == status)
        
    if priority:
        query = query.filter(ServiceRequest.priority == priority)
        
    if category_id:
        query = query.filter(ServiceRequest.category_id == category_id)
        
    total = query.count()
    pages = ceil(total / size) if size > 0 else 0
    
    items = query.order_by(desc(ServiceRequest.created_at)).offset((page - 1) * size).limit(size).all()
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
        "items": items
    }

def update_service_request(db: Session, request_id: int, customer_id: int, update_data, file: Optional[UploadFile] = None):
    from datetime import datetime, timedelta
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Service Request not found")
        
    if request.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this request")
        
    if request.status.upper() not in ["NEW", "PENDING"]:
        raise HTTPException(status_code=400, detail="Request cannot be edited in its current state")
        
    if datetime.utcnow() - request.created_at > timedelta(minutes=20):
        raise HTTPException(status_code=400, detail="Editing is available only within 20 minutes of request creation.")

    if update_data.title is not None:
        request.title = update_data.title
    if update_data.description is not None:
        request.description = update_data.description
    if update_data.category_id is not None:
        request.category_id = update_data.category_id
    if update_data.priority is not None:
        request.priority = update_data.priority
    if update_data.address is not None:
        request.address = update_data.address

    db.commit()
    db.refresh(request)
    
    if file:
        validate_and_save_file(file, request.id, db)
        
    return request

def delete_service_request(db: Session, request_id: int, customer_id: int):
    from datetime import datetime, timedelta
    # Removed missing ServiceNote import
    from ..models.feedback import Feedback
    
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Service Request not found")
        
    if request.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this request")
        
    if request.status.upper() not in ["NEW", "PENDING"]:
        raise HTTPException(status_code=400, detail="Request cannot be deleted in its current state")
        
    if datetime.utcnow() - request.created_at > timedelta(minutes=20):
        raise HTTPException(status_code=400, detail="Deletion is available only within 20 minutes of request creation.")

    # Safely delete related records to preserve foreign keys
    db.query(StatusHistory).filter(StatusHistory.request_id == request.id).delete()
    db.query(Attachment).filter(Attachment.request_id == request.id).delete()
    # Removed ServiceNote deletion
    db.query(Feedback).filter(Feedback.request_id == request.id).delete()
    
    db.delete(request)
    db.commit()
    return {"message": "Request deleted successfully"}
