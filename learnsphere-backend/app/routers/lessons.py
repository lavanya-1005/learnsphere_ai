
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
from fastapi.responses import FileResponse
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas import lesson
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from app.models.lesson_progress import LessonProgress

router = APIRouter(tags=["Lessons"])

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

def validate_lesson_content_type(lesson_type: str, content_url: str | None):
    if not content_url:
        return

    extension = content_url.lower().split("?")[0].split(".")[-1]

    allowed_extensions = {
        "video": ["mp4"],
        "pdf": ["pdf"],
        "note": ["txt", "pdf", "docx"],
        "resource": ["pdf", "docx", "txt", "jpg", "jpeg", "png", "mp4"]
    }

    if lesson_type not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid lesson type")

    if extension not in allowed_extensions[lesson_type]:
        raise HTTPException(
            status_code=400,
            detail=f"{lesson_type} lesson cannot use .{extension} file"
        )

def can_view_course_content(db: Session, course: Course, user: User):
    role = get_role(user)

    if role == "admin":
        return True

    if role == "instructor" and course.instructor_id == user.id:
        return True

    if role == "student":
        enrollment = db.query(Enrollment).filter(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course.id,
            Enrollment.status == "active"
        ).first()

        if enrollment:
            return True

    return False

@router.post("/courses/{course_id}/lessons", response_model=LessonResponse)
def create_lesson(
    course_id: int,
    request: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    role = get_role(current_user)

    if role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can add lessons"
        )
    
    existing_order = db.query(Lesson).filter(
    Lesson.course_id == course_id,
    Lesson.order_no == request.order_no
    ).first()

    if existing_order:
        raise HTTPException(
            status_code=400,
            detail="Lesson order number already exists for this course"
        )

    validate_lesson_content_type(request.type, request.content_url)

    lesson = Lesson(
        course_id=course_id,
        title=request.title,
        type=request.type,
        content_url=request.content_url,
        order_no=request.order_no
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return lesson

@router.get("/courses/{course_id}/lessons", response_model=list[LessonResponse])
def get_course_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not can_view_course_content(db, course, current_user):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view lessons for this course"
        )

    return db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).order_by(Lesson.order_no.asc()).all()

@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    course = db.query(Course).filter(Course.id == lesson.course_id).first()

    if not can_view_course_content(db, course, current_user):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view this lesson"
        )

    return lesson

@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: int,
    request: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    course = db.query(Course).filter(Course.id == lesson.course_id).first()

    role = get_role(current_user)

    if role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can update lessons"
        )

    new_type = request.type if request.type is not None else lesson.type
    new_content_url = request.content_url if request.content_url is not None else lesson.content_url
    new_order_no = request.order_no if request.order_no is not None else lesson.order_no

    if new_order_no != lesson.order_no:
        existing_order = db.query(Lesson).filter(
            Lesson.course_id == lesson.course_id,
            Lesson.order_no == new_order_no,
            Lesson.id != lesson.id
        ).first()

        if existing_order:
            raise HTTPException(
                status_code=400,
                detail="Lesson order number already exists for this course"
            )

    validate_lesson_content_type(new_type, new_content_url)

    if request.title is not None:
        lesson.title = request.title

    if request.type is not None:
        lesson.type = request.type

    if request.content_url is not None:
        lesson.content_url = request.content_url

    if request.order_no is not None:
        lesson.order_no = request.order_no

    db.commit()
    db.refresh(lesson)

    return lesson

@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found",
        )

    course = (
        db.query(Course)
        .filter(Course.id == lesson.course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    role = get_role(current_user)

    if role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can delete lessons",
        )

    content_file_path = None

    if lesson.content_url:
        relative_path = lesson.content_url.lstrip("/")

        if relative_path.startswith("uploads/content/"):
            candidate_path = os.path.abspath(
                os.path.join(os.getcwd(), relative_path)
            )

            uploads_directory = os.path.abspath(
                os.path.join(os.getcwd(), "uploads", "content")
            )

            if (
                os.path.commonpath(
                    [candidate_path, uploads_directory]
                )
                == uploads_directory
            ):
                content_file_path = candidate_path

    try:
        # Remove child records before deleting the lesson.
        db.query(LessonProgress).filter(
            LessonProgress.lesson_id == lesson_id
        ).delete(synchronize_session=False)

        db.delete(lesson)
        db.commit()

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to delete lesson",
        ) from exc

    # Delete the uploaded content after the database transaction succeeds.
    if content_file_path and os.path.exists(content_file_path):
        try:
            os.remove(content_file_path)
        except OSError:
            pass

    return {
        "message": "Lesson and related progress deleted successfully",
    }

@router.get("/lessons/{lesson_id}/content")
def get_lesson_content(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    course = db.query(Course).filter(Course.id == lesson.course_id).first()

    if not can_view_course_content(db, course, current_user):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view this lesson content"
        )

    if not lesson.content_url:
        raise HTTPException(status_code=404, detail="No content file found for this lesson")

    relative_path = lesson.content_url.lstrip("/")

    if not relative_path.startswith("uploads/content/"):
        raise HTTPException(
            status_code=400,
            detail="This lesson content is not a local uploaded file"
        )

    file_path = os.path.join(os.getcwd(), relative_path)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)