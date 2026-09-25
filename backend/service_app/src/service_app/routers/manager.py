from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.dependencies import require_role
from ..models.user import User
from ..schemas.user import UserResponse
from ..schemas.service_request import ServiceRequestResponse
from ..schemas.pagination import PaginatedResponse
from ..schemas.manager import (
    ServiceCategoryCreate,
    ServiceCategoryResponse,
    PriorityUpdate,
    TechnicianResponse,
    TechnicianCreate
)
from ..services import manager_service

# Ensure only managers can access these routes
router = APIRouter(
    prefix="/manager",
    tags=["Manager"],
    dependencies=[Depends(require_role(["MANAGER"]))]
)

# --- Request Management ---

@router.get("/requests", response_model=PaginatedResponse[ServiceRequestResponse])
def get_all_requests(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None,
    technician_id: Optional[int] = None
):
    return manager_service.get_all_requests(
        db=db,
        page=page,
        size=size,
        search=search,
        status=status,
        priority=priority,
        category_id=category_id,
        technician_id=technician_id
    )

@router.get("/requests/{request_id}", response_model=ServiceRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = manager_service.get_request_by_id(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req

@router.patch("/requests/{request_id}/priority", response_model=ServiceRequestResponse)
def update_priority(request_id: int, priority_data: PriorityUpdate, db: Session = Depends(get_db)):
    req = manager_service.update_request_priority(db, request_id, priority_data.priority)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req

from fastapi import Form, File, UploadFile

@router.put("/requests/{request_id}", response_model=ServiceRequestResponse)
def update_request(
    request_id: int,
    category_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    from ..schemas.service_request import ServiceRequestUpdate
    update_data = ServiceRequestUpdate(
        category_id=category_id,
        title=title,
        description=description,
        priority=priority,
        address=address
    )
    return manager_service.update_request(db, request_id, update_data, attachment)

@router.delete("/requests/{request_id}")
def delete_request(request_id: int, db: Session = Depends(get_db)):
    return manager_service.delete_request(db, request_id)

# --- Users & Technicians ---

@router.get("/customers", response_model=List[UserResponse])
def get_all_customers(db: Session = Depends(get_db)):
    return manager_service.get_customers(db)

@router.get("/technicians", response_model=List[TechnicianResponse])
def get_all_technicians(db: Session = Depends(get_db)):
    return manager_service.get_technicians(db)

@router.post("/technicians", response_model=TechnicianResponse, status_code=status.HTTP_201_CREATED)
def add_technician(tech_data: TechnicianCreate, db: Session = Depends(get_db)):
    return manager_service.create_technician(db, tech_data)

@router.delete("/technicians/{tech_id}")
def remove_technician(tech_id: int, db: Session = Depends(get_db)):
    return manager_service.delete_technician(db, tech_id)


# --- Service Categories ---

@router.get("/categories", response_model=List[ServiceCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return manager_service.get_categories(db)

@router.post("/categories", response_model=ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(cat_data: ServiceCategoryCreate, db: Session = Depends(get_db)):
    return manager_service.create_category(db, cat_data)
