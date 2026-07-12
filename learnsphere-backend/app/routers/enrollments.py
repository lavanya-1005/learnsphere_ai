from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.enrollment import EnrollmentResponse

router = APIRouter(tags=["Enrollments"])

@router.post("/courses/{course_id}/enroll", response_model=EnrollmentResponse)
def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can enroll in courses"
        )

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.price > 0:
        raise HTTPException(
            status_code=400,
            detail="This is a paid course. Please buy the course to enroll."
        )

    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=400,
            detail="You are already enrolled in this course"
        )

    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id,
        status="active"
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return enrollment

@router.get("/users/me/enrollments", response_model=list[EnrollmentResponse])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).order_by(Enrollment.enrolled_at.desc()).all()