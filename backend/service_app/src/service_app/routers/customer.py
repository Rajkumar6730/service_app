from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, RoleEnum, Address, ServiceRequest, Feedback, ServiceCategory
from ..schemas import (
    UserResponse, AddressCreate, AddressResponse, 
    ServiceRequestCreate, ServiceRequestResponse,
    FeedbackCreate, FeedbackResponse
)
from ..auth import require_role

router = APIRouter(prefix="/customer", tags=["Customer"])

# Dependency that ensures the current user is a customer
get_current_customer = require_role([RoleEnum.CUSTOMER])

@router.get("/me", response_model=UserResponse)
def get_customer_profile(current_user: User = Depends(get_current_customer)):
    return current_user

@router.post("/addresses", response_model=AddressResponse)
def add_address(address: AddressCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_customer)):
    new_address = Address(**address.model_dump(), user_id=current_user.id)
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

@router.get("/addresses", response_model=List[AddressResponse])
def get_addresses(db: Session = Depends(get_db), current_user: User = Depends(get_current_customer)):
    return db.query(Address).filter(Address.user_id == current_user.id).all()

@router.post("/requests", response_model=ServiceRequestResponse)
def create_service_request(request_data: ServiceRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_customer)):
    # Validate category exists
    category = db.query(ServiceCategory).filter(ServiceCategory.id == request_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Service Category not found")
        
    new_request = ServiceRequest(**request_data.model_dump(), customer_id=current_user.id)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/requests", response_model=List[ServiceRequestResponse])
def get_service_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_customer)):
    return db.query(ServiceRequest).filter(ServiceRequest.customer_id == current_user.id).all()

@router.post("/requests/{request_id}/feedback", response_model=FeedbackResponse)
def give_feedback(request_id: int, feedback_data: FeedbackCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_customer)):
    request_obj = db.query(ServiceRequest).filter(ServiceRequest.id == request_id, ServiceRequest.customer_id == current_user.id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Service Request not found or not owned by user")
    
    # Check if feedback already exists
    existing_feedback = db.query(Feedback).filter(Feedback.request_id == request_id).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this request")
        
    new_feedback = Feedback(**feedback_data.model_dump(), request_id=request_id, customer_id=current_user.id)
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback
