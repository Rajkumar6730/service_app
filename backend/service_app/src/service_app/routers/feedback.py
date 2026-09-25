from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.dependencies import require_role
from ..models.user import User
from ..schemas.feedback import FeedbackCreate, FeedbackResponse
from ..services import feedback_service

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
    dependencies=[Depends(require_role(["CUSTOMER"]))]
)

@router.post("/{request_id}", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    request_id: int, 
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["CUSTOMER"]))
):
    return feedback_service.submit_feedback(db, request_id, current_user.id, feedback_data)
