from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path
from .config import settings

# Determine if SQLite is used
connect_args = {}
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if db_url.startswith("sqlite:///./") and not db_url.startswith("sqlite:///:memory:"):
        db_filename = db_url.replace("sqlite:///./", "")
        # Resolve to backend/service_app root directory
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        resolved_db_path = (base_dir / db_filename).resolve()
        db_url = f"sqlite:///{resolved_db_path.as_posix()}"

# Create SQLAlchemy engine
engine = create_engine(
    db_url,
    connect_args=connect_args
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
