from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.service_request import ServiceRequest
from ..models.feedback import Feedback
from ..models.assignment import Assignment
from ..schemas.feedback import FeedbackCreate
from ..services.notification_service import create_notification, notify_all_managers

def submit_feedback(db: Session, request_id: int, customer_id: int, feedback_data: FeedbackCreate):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    if request.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="You can only submit feedback for your own requests")
        
    if request.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Feedback can only be submitted for completed requests")
        
    existing_feedback = db.query(Feedback).filter(Feedback.request_id == request_id).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback has already been submitted for this request")
        
    new_feedback = Feedback(
        request_id=request_id,
        customer_id=customer_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment
    )
    
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    
    # Notify Manager
    notify_all_managers(db, "New Feedback Received", f"A customer left a {feedback_data.rating}-star rating for request #{request.id}.")
    
    # Notify Technician
    assignment = db.query(Assignment).filter(Assignment.request_id == request.id).first()
    if assignment:
        create_notification(db, assignment.technician.user_id, "New Feedback Received", f"The customer left a {feedback_data.rating}-star rating for your work on request #{request.id}.")
    
    return new_feedback
