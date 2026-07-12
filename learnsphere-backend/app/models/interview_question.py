from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    question = Column(Text, nullable=False)
    difficulty = Column(String(50), default="easy")
    created_at = Column(DateTime, server_default=func.now())