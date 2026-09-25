from fastapi import APIRouter, Depends, status, Query, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.dependencies import require_role
from ..models.user import User
from ..schemas.service_request import ServiceRequestCreate, ServiceRequestResponse
from ..schemas.pagination import PaginatedResponse
from ..services import request_service

router = APIRouter(
    prefix="/service-requests",
    tags=["Service Requests"],
    dependencies=[Depends(require_role(["CUSTOMER"]))]
)

@router.post("", response_model=ServiceRequestResponse, status_code=status.HTTP_201_CREATED)
def create_service_request(
    category_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    priority: str = Form(...),
    address: str = Form(...),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["CUSTOMER"]))
):
    request_data = ServiceRequestCreate(
        category_id=category_id,
        title=title,
        description=description,
        priority=priority,
        address=address
    )
    return request_service.create_service_request(db, request_data, current_user.id, attachment)

@router.get("/my", response_model=PaginatedResponse[ServiceRequestResponse])
def get_my_requests(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["CUSTOMER"])),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None
):
    return request_service.get_my_requests(
        db=db, 
        customer_id=current_user.id,
        page=page,
        size=size,
        search=search,
        status=status,
        priority=priority,
        category_id=category_id
    )

@router.put("/{request_id}", response_model=ServiceRequestResponse)
def update_request(
    request_id: int,
    category_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["CUSTOMER"]))
):
    from ..schemas.service_request import ServiceRequestUpdate
    update_data = ServiceRequestUpdate(
        category_id=category_id,
        title=title,
        description=description,
        priority=priority,
        address=address
    )
    return request_service.update_service_request(db, request_id, current_user.id, update_data, attachment)

@router.delete("/{request_id}")
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["CUSTOMER"]))
):
    return request_service.delete_service_request(db, request_id, current_user.id)

