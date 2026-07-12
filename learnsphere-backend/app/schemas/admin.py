from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class AdminUserUpdate(BaseModel):
    role: str | None = None
    kyc_status: str | None = None

class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    kyc_status: str
    kyc_document_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class AdminCourseResponse(BaseModel):
    id: int
    title: str
    description: str | None
    instructor_id: int
    price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True

class AdminStatsResponse(BaseModel):
    total_users: int
    total_students: int
    total_instructors: int
    total_courses: int
    total_enrollments: int
    total_payments: int

class KYCUpdateRequest(BaseModel):
    kyc_status: str