import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use environment variable or default to a local MySQL DB 
# Change to root:root or whatever credentials are valid for the user
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+mysqlconnector://root:root@localhost:3306/service_request_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
