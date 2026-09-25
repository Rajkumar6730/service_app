from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.assignment import Assignment
from ..models.service_request import ServiceRequest
from ..models.technician import Technician
from ..models.status_history import StatusHistory
from ..schemas.assignment import AssignmentCreate
from ..services.notification_service import create_notification

def create_assignment(db: Session, assign_data: AssignmentCreate, manager_id: int):
    from datetime import datetime, timedelta
    # Verify request exists
    request = db.query(ServiceRequest).filter(ServiceRequest.id == assign_data.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Service request not found")

    if datetime.utcnow() - request.created_at < timedelta(minutes=30):
        raise HTTPException(status_code=400, detail="This request can be assigned only after 30 minutes from creation.")

    if not assign_data.technician_ids:
        raise HTTPException(status_code=400, detail="At least one technician must be selected.")

    # Count existing assignments
    existing_assignments = db.query(Assignment).filter(
        Assignment.request_id == assign_data.request_id
    ).all()
    
    current_count = len(existing_assignments)
    
    if current_count + len(assign_data.technician_ids) > 6:
        raise HTTPException(status_code=400, detail="Maximum 6 technicians can be assigned to one request.")

    existing_tech_ids = {a.technician_id for a in existing_assignments}

    new_assignments = []
    technicians = []
    
    for tech_id in assign_data.technician_ids:
        if tech_id in existing_tech_ids:
            raise HTTPException(status_code=400, detail=f"Technician with ID {tech_id} is already assigned to this request.")
            
        technician = db.query(Technician).filter(Technician.id == tech_id).first()
        if not technician:
            raise HTTPException(status_code=404, detail=f"Technician with ID {tech_id} not found.")
            
        technicians.append(technician)
        
        new_assignment = Assignment(
            request_id=assign_data.request_id,
            technician_id=tech_id,
            assigned_by=manager_id,
            status="ASSIGNED"
        )
        db.add(new_assignment)
        new_assignments.append(new_assignment)
        
        # Log History per technician
        history = StatusHistory(
            request_id=assign_data.request_id,
            status="ASSIGNED",
            changed_by=manager_id,
            remarks=f"Assigned to technician ID {tech_id}"
        )
        db.add(history)

    # Update Request Status if it's NEW or PENDING
    if request.status in ["NEW", "PENDING"]:
        request.status = "ASSIGNED"

    db.commit()

    for na in new_assignments:
        db.refresh(na)
        
    # Send Notifications
    # Notify Customer only once for the batch
    create_notification(
        db,
        request.customer_id,
        "Technician(s) Assigned",
        f"Technicians have been assigned to your request #{request.id}. They will review it shortly."
    )
    
    # Notify each Technician
    for technician in technicians:
        create_notification(
            db,
            technician.user_id,
            "New Job Assigned",
            f"You have been assigned a new work order (#{request.id}). Please review and accept it."
        )
    
    return new_assignments

def get_my_assignments(db: Session, tech_user_id: int):
    technician = db.query(Technician).filter(Technician.user_id == tech_user_id).first()
    if not technician:
        return []
    return db.query(Assignment).filter(Assignment.technician_id == technician.id).all()
