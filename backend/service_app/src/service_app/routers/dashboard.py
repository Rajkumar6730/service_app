from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.dependencies import require_role
from ..schemas.dashboard import DashboardStatsResponse
from ..services import report_service

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(require_role(["MANAGER"]))]
)

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return report_service.get_dashboard_stats(db)
