from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.dependencies import require_role
from ..models.user import User
from ..schemas.assignment import AssignmentCreate, AssignmentResponse
from ..services import assignment_service

router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"],
)

@router.post("", response_model=List[AssignmentResponse])
def create_assignment(
    assign_data: AssignmentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["MANAGER"]))
):
    return assignment_service.create_assignment(db, assign_data, current_user.id)

@router.get("/my", response_model=List[AssignmentResponse])
def get_my_assignments(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["TECHNICIAN"]))
):
    return assignment_service.get_my_assignments(db, current_user.id)
