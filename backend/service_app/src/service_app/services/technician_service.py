from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from math import ceil
from typing import Optional
from fastapi import HTTPException

from ..models.technician import Technician
from ..models.assignment import Assignment
from ..models.service_request import ServiceRequest
from ..models.status_history import StatusHistory
from ..schemas.technician import StatusUpdate
from ..services.notification_service import create_notification, notify_all_managers

# Valid state transitions
VALID_TRANSITIONS = {
    "ASSIGNED": ["ACCEPTED"],
    "ACCEPTED": ["IN_PROGRESS"],
    "IN_PROGRESS": ["COMPLETED"]
}

def get_assigned_requests(
    db: Session, 
    user_id: int,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None
):
    technician = db.query(Technician).filter(Technician.user_id == user_id).first()
    if not technician:
        technician = Technician(user_id=user_id, specialization="General", experience="N/A", availability="Available")
        db.add(technician)
        db.commit()
        db.refresh(technician)
    
    query = db.query(ServiceRequest).join(Assignment, ServiceRequest.id == Assignment.request_id)\
              .filter(Assignment.technician_id == technician.id)
              
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
    
    items = query.order_by(desc(ServiceRequest.updated_at)).offset((page - 1) * size).limit(size).all()
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
        "items": items
    }

def update_request_status(db: Session, user_id: int, request_id: int, status_update: StatusUpdate):
    technician = db.query(Technician).filter(Technician.user_id == user_id).first()
    if not technician:
        raise HTTPException(status_code=400, detail="User is not a registered technician")

    assignment = db.query(Assignment).filter(
        Assignment.technician_id == technician.id,
        Assignment.request_id == request_id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=403, detail="Not assigned to this request")

    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    current_status = getattr(assignment, 'status', 'ASSIGNED')
    new_status = status_update.status

    allowed_next_states = VALID_TRANSITIONS.get(current_status, [])
    if new_status not in allowed_next_states:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid transition from {current_status} to {new_status}. Allowed: {allowed_next_states}"
        )

    assignment.status = new_status
    request.status = new_status
    
    history = StatusHistory(
        request_id=request_id,
        status=new_status,
        changed_by=user_id,
        remarks=status_update.remarks
    )
    
    db.add(history)
    db.commit()
    db.refresh(request)
    
    # Notifications
    if new_status == "ACCEPTED":
        create_notification(db, request.customer_id, "Request Accepted", f"The technician has accepted your request #{request.id} and will begin work soon.")
    elif new_status == "IN_PROGRESS":
        create_notification(db, request.customer_id, "Work Started", f"The technician has started work on your request #{request.id}.")
    elif new_status == "COMPLETED":
        create_notification(db, request.customer_id, "Request Completed", f"Your request #{request.id} has been marked as completed. Please leave feedback!")
        notify_all_managers(db, "Work Completed", f"Technician finished work on request #{request.id}.")

    return request
