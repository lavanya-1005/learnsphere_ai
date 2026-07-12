from pydantic import BaseModel
from datetime import datetime

class AIChatRequest(BaseModel):
    course_id: int | None = None
    message: str

class AIChatResponse(BaseModel):
    id: int
    user_id: int
    course_id: int | None
    message: str
    response: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True