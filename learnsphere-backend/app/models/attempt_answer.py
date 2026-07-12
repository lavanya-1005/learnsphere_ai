from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from app.core.database import Base

class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String(1), nullable=False)
    correct_answer = Column(String(1), nullable=False)
    is_correct = Column(Boolean, default=False)
    marks_awarded = Column(Integer, default=0)