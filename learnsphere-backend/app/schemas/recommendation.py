from pydantic import BaseModel
from decimal import Decimal

class RecommendedCourseResponse(BaseModel):
    id: int
    title: str
    description: str | None
    instructor_id: int
    price: Decimal
    enrollment_count: int
    reason: str

    class Config:
        from_attributes = True