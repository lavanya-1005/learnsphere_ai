from pydantic import BaseModel
from datetime import datetime

class CertificateResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    url: str
    issued_at: datetime

    class Config:
        from_attributes = True