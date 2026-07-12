from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from app.core.database import Base

class AIChat(Base):
    __tablename__ = "ai_chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    source = Column(String(50), default="groq_ai")
    created_at = Column(DateTime, server_default=func.now())