from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.dependencies import require_role
from ..models.user import User
from ..schemas.service_request import ServiceRequestResponse
from ..schemas.technician import StatusUpdate
from ..schemas.pagination import PaginatedResponse
from ..services import technician_service

router = APIRouter(
    prefix="/technician",
    tags=["Technician"],
    dependencies=[Depends(require_role(["TECHNICIAN"]))]
)

@router.get("/requests", response_model=PaginatedResponse[ServiceRequestResponse])
def get_assigned_requests(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["TECHNICIAN"])),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None
):
    return technician_service.get_assigned_requests(
        db=db, 
        user_id=current_user.id,
        page=page,
        size=size,
        search=search,
        status=status,
        priority=priority,
        category_id=category_id
    )

@router.post("/requests/{request_id}/status", response_model=ServiceRequestResponse)
def update_request_status(
    request_id: int, 
    status_update: StatusUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["TECHNICIAN"]))
):
    return technician_service.update_request_status(db, current_user.id, request_id, status_update)
