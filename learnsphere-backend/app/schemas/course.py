from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime

class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    price: Decimal = 0

class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = None
    price: Decimal | None = None

class CourseResponse(BaseModel):
    id: int
    title: str
    description: str | None
    instructor_id: int
    price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True