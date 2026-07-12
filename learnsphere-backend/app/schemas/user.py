from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    kyc_status: str
    kyc_document_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None

class ChangePasswordRequest(BaseModel):
    old_password: str = Field(min_length=6, max_length=72)
    new_password: str = Field(min_length=6, max_length=72)