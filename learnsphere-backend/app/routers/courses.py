from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_instructor_or_admin
from app.models.course import Course
from app.models.user import User
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

@router.post("/", response_model=CourseResponse)
def create_course(
    request: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    role = get_role(current_user)

    if role == "instructor" and current_user.kyc_status != "approved":
        raise HTTPException(
            status_code=403,
            detail="KYC approval is required before creating courses"
        )

    course = Course(
        title=request.title,
        description=request.description,
        price=request.price,
        instructor_id=current_user.id
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return course

@router.get("/", response_model=list[CourseResponse])
def get_courses(
    search: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if page < 1:
        page = 1

    if limit < 1:
        limit = 10

    if limit > 50:
        limit = 50

    query = db.query(Course)

    if search:
        search_text = f"%{search}%"
        query = query.filter(
            Course.title.like(search_text) |
            Course.description.like(search_text)
        )

    if min_price is not None:
        query = query.filter(Course.price >= min_price)

    if max_price is not None:
        query = query.filter(Course.price <= max_price)

    offset = (page - 1) * limit

    return query.order_by(Course.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    request: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    role = get_role(current_user)

    if course.instructor_id != current_user.id and role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this course"
        )

    if request.title is not None:
        course.title = request.title

    if request.description is not None:
        course.description = request.description

    if request.price is not None:
        course.price = request.price

    db.commit()
    db.refresh(course)

    return course

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    role = get_role(current_user)

    if course.instructor_id != current_user.id and role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to delete this course"
        )

    db.delete(course)
    db.commit()

    return {"message": "Course deleted successfully"}