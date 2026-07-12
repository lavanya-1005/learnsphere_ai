from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Float, UniqueConstraint
from sqlalchemy.sql import func
from app.core.database import Base

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    score = Column(Integer, default=0)
    percentage = Column(Float, default=0)
    result = Column(String(20), default="fail")
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "assessment_id", name="unique_user_assessment_attempt"),
    )