from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import verify_password, hash_password
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest, ChangePasswordRequest
import os
from uuid import uuid4
from fastapi import File, UploadFile

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_my_profile(
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if request.email is not None:
        existing_user = db.query(User).filter(
            User.email == request.email,
            User.id != current_user.id
        ).first()

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")

        current_user.email = request.email

    if request.name is not None:
        current_user.name = request.name

    db.commit()
    db.refresh(current_user)

    return current_user

@router.put("/me/password")
def change_my_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    current_user.password_hash = hash_password(request.new_password)

    db.commit()

    return {"message": "Password changed successfully"}

KYC_UPLOAD_DIR = "uploads/kyc"

@router.post("/me/kyc", response_model=UserResponse)
def upload_my_kyc(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can upload KYC documents")

    os.makedirs(KYC_UPLOAD_DIR, exist_ok=True)

    original_filename = file.filename or ""
    _, extension = os.path.splitext(original_filename)
    extension = extension.lower()

    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png"}

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG, and PNG files are allowed"
        )

    safe_filename = f"{uuid4()}{extension}"
    file_path = os.path.join(KYC_UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    current_user.kyc_document_url = f"/uploads/kyc/{safe_filename}"
    current_user.kyc_status = "submitted"

    db.commit()
    db.refresh(current_user)

    return current_user