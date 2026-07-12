from sqlalchemy import Column, Date, ForeignKey, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    target_date = Column(Date, nullable=False)
    daily_minutes = Column(Integer, default=30)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, server_default=func.now())