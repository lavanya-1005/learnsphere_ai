from pydantic import BaseModel
from datetime import datetime

class LessonProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    completed_at: datetime

    class Config:
        from_attributes = True