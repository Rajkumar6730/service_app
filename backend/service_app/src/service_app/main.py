from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .core.database import get_db, Base, engine
from .models import * # to ensure tables are created by Base.metadata
from .routers import auth_router, service_requests_router, manager_router, technician_router, assignments_router, feedback_router, notifications_router, dashboard_router, attachments_router

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def init_db_migrations():
    try:
        with engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(service_requests)")).fetchall()
            existing_cols = [row[1] for row in res]
            if existing_cols:
                if "service_unavailable" not in existing_cols:
                    conn.execute(text("ALTER TABLE service_requests ADD COLUMN service_unavailable BOOLEAN DEFAULT 0"))
                if "unavailability_message" not in existing_cols:
                    conn.execute(text("ALTER TABLE service_requests ADD COLUMN unavailability_message VARCHAR(255)"))
                if "unavailability_updated_at" not in existing_cols:
                    conn.execute(text("ALTER TABLE service_requests ADD COLUMN unavailability_updated_at DATETIME"))
                conn.commit()

            res_notif = conn.execute(text("PRAGMA table_info(notifications)")).fetchall()
            existing_notif_cols = [row[1] for row in res_notif]
            if existing_notif_cols:
                if "request_id" not in existing_notif_cols:
                    conn.execute(text("ALTER TABLE notifications ADD COLUMN request_id INTEGER"))
                if "notification_type" not in existing_notif_cols:
                    conn.execute(text("ALTER TABLE notifications ADD COLUMN notification_type VARCHAR(50) DEFAULT 'GENERAL'"))
                conn.commit()
    except Exception as e:
        print(f"DB Migration Note: {e}")

init_db_migrations()

app = FastAPI(
    title="Service Request API",
    description="FastAPI backend with authentication and Service Requests"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(service_requests_router)
app.include_router(manager_router)
app.include_router(technician_router)
app.include_router(assignments_router)
app.include_router(feedback_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)
app.include_router(attachments_router)

@app.get("/")
def home():
    return {"message": "Service Request API is running"}

@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1")).fetchone()
        if result and result[0] == 1:
            return {"status": "success", "message": "Successfully connected to the database!"}
        else:
            raise HTTPException(status_code=500, detail="Unexpected result.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")
