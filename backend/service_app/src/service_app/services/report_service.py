from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from ..models.service_request import ServiceRequest
from ..models.user import User
from ..models.technician import Technician
from ..models.feedback import Feedback
from ..models.service_category import ServiceCategory
from ..models.assignment import Assignment

def get_dashboard_stats(db: Session):
    # Core Stats
    total_requests = db.query(func.count(ServiceRequest.id)).scalar() or 0
    new_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == 'NEW').scalar() or 0
    assigned_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == 'ASSIGNED').scalar() or 0
    in_progress_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == 'IN_PROGRESS').scalar() or 0
    completed_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == 'COMPLETED').scalar() or 0
    cancelled_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == 'CANCELLED').scalar() or 0
    
    total_customers = db.query(func.count(User.id)).filter(User.role == 'CUSTOMER').scalar() or 0
    total_technicians = db.query(func.count(User.id)).filter(User.role == 'TECHNICIAN').scalar() or 0
    
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0.0

    # Status Distribution Chart
    status_distribution = [
        {"name": "New", "value": new_requests},
        {"name": "Assigned", "value": assigned_requests},
        {"name": "In Progress", "value": in_progress_requests},
        {"name": "Completed", "value": completed_requests},
        {"name": "Cancelled", "value": cancelled_requests}
    ]

    # Category Distribution Chart
    categories = db.query(ServiceCategory.name, func.count(ServiceRequest.id).label('count')).\
        outerjoin(ServiceRequest, ServiceCategory.id == ServiceRequest.category_id).\
        group_by(ServiceCategory.id).all()
    
    category_distribution = [{"name": c[0], "value": c[1]} for c in categories]

    # Monthly Requests Chart (Last 12 Months approximated by simple grouping)
    dialect = db.get_bind().dialect.name
    if dialect == 'sqlite':
        month_col = func.strftime('%Y-%m', ServiceRequest.created_at)
    elif dialect == 'postgresql':
        month_col = func.to_char(ServiceRequest.created_at, 'YYYY-MM')
    else:
        month_col = func.date_format(ServiceRequest.created_at, '%Y-%m')

    monthly_data = db.query(
        month_col.label('month'),
        func.count(ServiceRequest.id).label('count')
    ).group_by('month').order_by('month').all()
    
    monthly_requests = [{"name": m[0], "requests": m[1]} for m in monthly_data]

    # Technician Workload Chart (Assigned & In Progress requests per technician)
    tech_workload = db.query(
        User.name,
        func.count(Assignment.id).label('count')
    ).join(Technician, User.id == Technician.user_id)\
     .join(Assignment, Technician.id == Assignment.technician_id)\
     .join(ServiceRequest, Assignment.request_id == ServiceRequest.id)\
     .filter(ServiceRequest.status.in_(['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS']))\
     .group_by(User.id).all()
     
    technician_workload = [{"name": t[0], "tasks": t[1]} for t in tech_workload]

    return {
        "total_requests": total_requests,
        "new_requests": new_requests,
        "assigned_requests": assigned_requests,
        "in_progress_requests": in_progress_requests,
        "completed_requests": completed_requests,
        "cancelled_requests": cancelled_requests,
        "total_customers": total_customers,
        "total_technicians": total_technicians,
        "average_rating": round(avg_rating, 1),
        "status_distribution": status_distribution,
        "category_distribution": category_distribution,
        "monthly_requests": monthly_requests,
        "technician_workload": technician_workload
    }
