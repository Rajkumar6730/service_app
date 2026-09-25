from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from math import ceil
from typing import Optional

from ..models.user import User
from ..models.technician import Technician
from ..models.service_category import ServiceCategory
from ..models.service_request import ServiceRequest
from ..models.assignment import Assignment
from ..schemas.manager import ServiceCategoryCreate

# --- User Management ---

def get_customers(db: Session):
    return db.query(User).filter(User.role == "CUSTOMER").order_by(desc(User.created_at)).all()

def get_technicians(db: Session):
    # Eager load the user object for technician profiles
    return db.query(Technician).join(User).order_by(desc(User.created_at)).all()

def create_technician(db: Session, tech_data):
    from fastapi import HTTPException
    from ..core.security import get_password_hash
    
    # Check max limit
    active_count = db.query(Technician).join(User).count()
    if active_count >= 6:
        raise HTTPException(status_code=400, detail="Maximum limit of 6 technicians reached.")
        
    # Check email
    existing_user = db.query(User).filter(User.email == tech_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(tech_data.password)
    new_user = User(
        name=tech_data.name,
        email=tech_data.email,
        phone=tech_data.phone,
        role="TECHNICIAN",
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    new_tech = Technician(
        user_id=new_user.id,
        specialization=tech_data.specialization or "General",
        experience=tech_data.experience or "New",
        availability=tech_data.availability or "Available"
    )
    db.add(new_tech)
    db.commit()
    db.refresh(new_tech)
    
    return new_tech

def delete_technician(db: Session, tech_id: int):
    from fastapi import HTTPException
    tech = db.query(Technician).filter(Technician.id == tech_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
        
    user = db.query(User).filter(User.id == tech.user_id).first()
    db.delete(tech)
    if user:
        db.delete(user)
    db.commit()
        
    return {"message": "Technician removed successfully"}

# --- Category Management ---

def get_categories(db: Session):
    return db.query(ServiceCategory).all()

def create_category(db: Session, category_data: ServiceCategoryCreate):
    new_cat = ServiceCategory(
        name=category_data.name,
        description=category_data.description,
        is_active=category_data.is_active
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

# --- Request Management ---

def get_all_requests(
    db: Session,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None,
    technician_id: Optional[int] = None
):
    query = db.query(ServiceRequest)
    
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
        
    if technician_id:
        query = query.join(Assignment, ServiceRequest.id == Assignment.request_id)\
                     .filter(Assignment.technician_id == technician_id)
                     
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

def get_request_by_id(db: Session, request_id: int):
    return db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()

def update_request_priority(db: Session, request_id: int, priority: str):
    db_req = get_request_by_id(db, request_id)
    if db_req:
        db_req.priority = priority
        db.commit()
        db.refresh(db_req)
    return db_req

def update_request(db: Session, request_id: int, update_data, file=None):
    from fastapi import HTTPException
    from .request_service import validate_and_save_file
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Service Request not found")
        
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

def delete_request(db: Session, request_id: int):
    from fastapi import HTTPException
    from ..models.status_history import StatusHistory
    from ..models.attachment import Attachment
    from ..models.feedback import Feedback
    
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Service Request not found")

    db.query(StatusHistory).filter(StatusHistory.request_id == request.id).delete()
    db.query(Attachment).filter(Attachment.request_id == request.id).delete()
    db.query(Feedback).filter(Feedback.request_id == request.id).delete()
    
    db.delete(request)
    db.commit()
    return {"message": "Request deleted successfully"}
