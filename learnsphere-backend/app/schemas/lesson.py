from pydantic import BaseModel, Field

class LessonCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    type: str = Field(pattern="^(video|pdf|note|resource)$")
    content_url: str | None = None
    order_no: int = 1

class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    type: str | None = Field(default=None, pattern="^(video|pdf|note|resource)$")
    content_url: str | None = None
    order_no: int | None = None

class LessonResponse(BaseModel):
    id: int
    course_id: int
    title: str
    type: str
    content_url: str | None
    order_no: int

    class Config:
        from_attributes = True