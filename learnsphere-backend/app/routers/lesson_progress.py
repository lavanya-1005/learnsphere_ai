from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson
from app.models.lesson_progress import LessonProgress
from app.models.user import User
from app.schemas.lesson_progress import LessonProgressResponse

router = APIRouter(tags=["Lesson Progress"])

@router.post("/lessons/{lesson_id}/complete", response_model=LessonProgressResponse)
def mark_lesson_complete(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can complete lessons")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == lesson.course_id,
        Enrollment.status == "active"
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    existing_progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if existing_progress:
        return existing_progress

    progress = LessonProgress(
        user_id=current_user.id,
        lesson_id=lesson_id
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return progress

@router.get("/users/me/lesson-progress", response_model=list[LessonProgressResponse])
def get_my_lesson_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id
    ).order_by(LessonProgress.completed_at.desc()).all()