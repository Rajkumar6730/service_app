from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    content_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("ServiceRequest", back_populates="attachments")
