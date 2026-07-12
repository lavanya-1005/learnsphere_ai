from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.assessment import Assessment
from app.models.attempt import Attempt
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson
from app.models.user import User
from app.models.lesson_progress import LessonProgress
from app.schemas.analytics import (
    StudentCourseProgressResponse,
    InstructorCourseAnalyticsResponse
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

@router.get("/courses/{course_id}/progress", response_model=StudentCourseProgressResponse)
def get_student_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = get_role(current_user)

    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can view course progress")

    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.status == "active"
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    total_lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).count()

    assessments = db.query(Assessment).filter(
        Assessment.course_id == course_id
    ).all()

    total_assessments = len(assessments)
    assessment_ids = [assessment.id for assessment in assessments]

    completed_attempts = 0
    passed_assessments = 0

    if assessment_ids:
        completed_attempts = db.query(Attempt).filter(
            Attempt.user_id == current_user.id,
            Attempt.assessment_id.in_(assessment_ids)
        ).count()

        passed_assessments = db.query(Attempt).filter(
            Attempt.user_id == current_user.id,
            Attempt.assessment_id.in_(assessment_ids),
            Attempt.result == "pass"
        ).count()

    lesson_ids = [
    lesson.id
    for lesson in db.query(Lesson).filter(Lesson.course_id == course_id).all()
    ]

    completed_lessons = 0

    if lesson_ids:
        completed_lessons = db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id.in_(lesson_ids)
        ).count()

    total_items = total_lessons + total_assessments
    completed_items = completed_lessons + passed_assessments
    progress_percentage = 0

    if total_items > 0:
        progress_percentage = (completed_items / total_items) * 100

    return {
    "course_id": course_id,
    "total_lessons": total_lessons,
    "completed_lessons": completed_lessons,
    "total_assessments": total_assessments,
    "completed_attempts": completed_attempts,
    "passed_assessments": passed_assessments,
    "progress_percentage": progress_percentage
    }

@router.get("/instructor/courses/{course_id}", response_model=InstructorCourseAnalyticsResponse)
def get_instructor_course_analytics(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = get_role(current_user)

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can view this analytics"
        )

    total_enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).count()

    total_lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).count()

    assessments = db.query(Assessment).filter(
        Assessment.course_id == course_id
    ).all()

    assessment_ids = [assessment.id for assessment in assessments]

    total_assessments = len(assessment_ids)
    total_attempts = 0
    average_score = 0

    if assessment_ids:
        total_attempts = db.query(Attempt).filter(
            Attempt.assessment_id.in_(assessment_ids)
        ).count()

        avg = db.query(func.avg(Attempt.score)).filter(
            Attempt.assessment_id.in_(assessment_ids)
        ).scalar()

        average_score = float(avg) if avg is not None else 0

    return {
        "course_id": course_id,
        "total_enrollments": total_enrollments,
        "total_lessons": total_lessons,
        "total_assessments": total_assessments,
        "total_attempts": total_attempts,
        "average_score": average_score
    }