from datetime import datetime
from pydantic import BaseModel, Field

class InterviewQuestionCreate(BaseModel):
    category: str = Field(min_length=2, max_length=100)
    question: str = Field(min_length=5)
    difficulty: str = "easy"

class InterviewQuestionResponse(BaseModel):
    id: int
    category: str
    question: str
    difficulty: str
    created_at: datetime

    class Config:
        from_attributes = True

class MockInterviewRequest(BaseModel):
    question_id: int
    answer: str = Field(min_length=5)

class MockInterviewResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    answer: str
    feedback: str
    score: int
    created_at: datetime

    class Config:
        from_attributes = True