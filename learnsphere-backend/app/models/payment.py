from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    txn_id = Column(String(100), unique=True, nullable=False)
    status = Column(String(50), default="success")
    type = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now())