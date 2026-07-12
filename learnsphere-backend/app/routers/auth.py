from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from datetime import datetime, timedelta
from uuid import uuid4
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest

from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if request.role not in ["student", "instructor"]:
        raise HTTPException(
            status_code=400,
            detail="Public registration only supports student or instructor role"
        )

    new_user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "role": new_user.role
    }

@router.post("/login", response_model=TokenResponse)
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else user.role
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = str(uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    user.reset_token = reset_token
    user.reset_token_expires_at = expires_at

    db.commit()

    return {
        "message": "Password reset token generated successfully",
        "reset_token": reset_token,
        "expires_in_minutes": 15
    }

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.reset_token == request.reset_token
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    if user.reset_token_expires_at is None or user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token expired")

    user.password_hash = hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None

    db.commit()

    return {
        "message": "Password reset successfully"
    }