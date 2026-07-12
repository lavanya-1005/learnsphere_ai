from datetime import date, datetime
from pydantic import BaseModel, Field

class StudyPlanCreate(BaseModel):
    course_id: int
    title: str = Field(min_length=3, max_length=200)
    target_date: date
    daily_minutes: int = Field(default=30, ge=10, le=300)

class StudyPlanUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    target_date: date | None = None
    daily_minutes: int | None = Field(default=None, ge=10, le=300)
    status: str | None = None

class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    title: str
    target_date: date
    daily_minutes: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True