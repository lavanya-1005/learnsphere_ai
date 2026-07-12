from pydantic import BaseModel, Field
from datetime import datetime

class AssessmentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)

class AssessmentResponse(BaseModel):
    id: int
    course_id: int
    title: str
    total_marks: int
    created_at: datetime

    class Config:
        from_attributes = True

class AssessmentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)

class QuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    answer: str = Field(pattern="^[ABCD]$")
    marks: int = 1

class QuestionResponse(BaseModel):
    id: int
    assessment_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    marks: int

    class Config:
        from_attributes = True

class QuestionUpdate(BaseModel):
    question: str | None = None
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    answer: str | None = Field(default=None, pattern="^[ABCD]$")
    marks: int | None = None

class AnswerSubmit(BaseModel):
    question_id: int
    answer: str = Field(pattern="^[ABCD]$")

class AttemptSubmit(BaseModel):
    answers: list[AnswerSubmit]

class AttemptResponse(BaseModel):
    id: int
    user_id: int
    assessment_id: int
    score: int
    percentage: float
    result: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AttemptAnswerResponse(BaseModel):
    id: int
    attempt_id: int
    question_id: int
    selected_answer: str
    correct_answer: str
    is_correct: bool
    marks_awarded: int

    class Config:
        from_attributes = True