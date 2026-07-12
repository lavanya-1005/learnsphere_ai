from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.recommendation import RecommendedCourseResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

@router.get("/courses", response_model=list[RecommendedCourseResponse])
def recommend_courses(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = get_role(current_user)

    if role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can view course recommendations"
        )

    if limit < 1:
        limit = 5

    if limit > 20:
        limit = 20

    enrolled_course_ids = [
        enrollment.course_id
        for enrollment in db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id,
            Enrollment.status == "active"
        ).all()
    ]

    query = db.query(
        Course,
        func.count(Enrollment.id).label("enrollment_count")
    ).outerjoin(
        Enrollment,
        Course.id == Enrollment.course_id
    )

    if hasattr(Course, "is_active"):
        query = query.filter(Course.is_active == True)

    if enrolled_course_ids:
        query = query.filter(~Course.id.in_(enrolled_course_ids))

    recommended_courses = query.group_by(
        Course.id
    ).order_by(
        func.count(Enrollment.id).desc(),
        Course.created_at.desc()
    ).limit(limit).all()

    response = []

    for course, enrollment_count in recommended_courses:
        response.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "instructor_id": course.instructor_id,
            "price": course.price,
            "enrollment_count": enrollment_count,
            "reason": "Recommended because this course is popular among students"
            if enrollment_count > 0
            else "Recommended as a new course you have not enrolled in"
        })

    return response