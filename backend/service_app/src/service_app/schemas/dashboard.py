from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardStatsResponse(BaseModel):
    total_requests: int
    new_requests: int
    assigned_requests: int
    in_progress_requests: int
    completed_requests: int
    cancelled_requests: int
    total_customers: int
    total_technicians: int
    average_rating: float
    
    # Chart Data
    status_distribution: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    monthly_requests: List[Dict[str, Any]]
    technician_workload: List[Dict[str, Any]]

    class Config:
        from_attributes = True
