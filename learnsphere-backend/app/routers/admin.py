from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.user import User
from app.schemas.admin import (
    AdminUserUpdate,
    AdminUserResponse,
    AdminCourseResponse,
    AdminStatsResponse
)
from app.schemas.admin import KYCUpdateRequest
router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", response_model=list[AdminUserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.get("/users/{user_id}", response_model=AdminUserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.put("/users/{user_id}", response_model=AdminUserResponse)
def update_user_by_admin(
    user_id: int,
    request: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if request.role is not None:
        if request.role not in ["student", "instructor", "admin"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = request.role

    if request.kyc_status is not None:
        user.kyc_status = request.kyc_status

    db.commit()
    db.refresh(user)

    return user

@router.get("/courses", response_model=list[AdminCourseResponse])
def get_all_courses_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(Course).order_by(Course.created_at.desc()).all()

@router.delete("/courses/{course_id}")
def delete_course_admin(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()

    return {"message": "Course deleted successfully by admin"}

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_instructors = db.query(User).filter(User.role == "instructor").count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    total_payments = db.query(Payment).count()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_instructors": total_instructors,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_payments": total_payments
    }

@router.get("/kyc-requests", response_model=list[AdminUserResponse])
def get_kyc_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(User).filter(
        User.kyc_status == "submitted"
    ).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/kyc", response_model=AdminUserResponse)
def update_user_kyc_status(
    user_id: int,
    request: KYCUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if request.kyc_status not in ["approved", "rejected", "submitted", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid KYC status")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.kyc_status = request.kyc_status

    db.commit()
    db.refresh(user)

    return user