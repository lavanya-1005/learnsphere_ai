from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: str = "student"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(min_length=6, max_length=72)