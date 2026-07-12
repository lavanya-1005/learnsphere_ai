from sqlalchemy import Column, Integer, String, Text, ForeignKey, Numeric, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    price = Column(Numeric(10, 2), default=0)
    created_at = Column(DateTime, server_default=func.now())