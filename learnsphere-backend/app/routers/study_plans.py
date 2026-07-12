from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.study_plan import StudyPlan
from app.models.user import User
from app.schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanUpdate,
    StudyPlanResponse
)

router = APIRouter(prefix="/study-plans", tags=["Study Plans"])

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

@router.post("/", response_model=StudyPlanResponse)
def create_study_plan(
    request: StudyPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = get_role(current_user)

    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can create study plans")

    course = db.query(Course).filter(Course.id == request.course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == request.course_id,
        Enrollment.status == "active"
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="You must be enrolled in this course")

    if request.target_date < date.today():
        raise HTTPException(status_code=400, detail="Target date cannot be in the past")

    study_plan = StudyPlan(
        user_id=current_user.id,
        course_id=request.course_id,
        title=request.title,
        target_date=request.target_date,
        daily_minutes=request.daily_minutes,
        status="active"
    )

    db.add(study_plan)
    db.commit()
    db.refresh(study_plan)

    return study_plan

@router.get("/me", response_model=list[StudyPlanResponse])
def get_my_study_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id
    ).order_by(StudyPlan.created_at.desc()).all()

@router.put("/{plan_id}", response_model=StudyPlanResponse)
def update_study_plan(
    plan_id: int,
    request: StudyPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    study_plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id
    ).first()

    if not study_plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    if request.title is not None:
        study_plan.title = request.title

    if request.target_date is not None:
        if request.target_date < date.today():
            raise HTTPException(status_code=400, detail="Target date cannot be in the past")
        study_plan.target_date = request.target_date

    if request.daily_minutes is not None:
        study_plan.daily_minutes = request.daily_minutes

    if request.status is not None:
        if request.status not in ["active", "completed", "cancelled"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        study_plan.status = request.status

    db.commit()
    db.refresh(study_plan)

    return study_plan

@router.delete("/{plan_id}")
def delete_study_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    study_plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id
    ).first()

    if not study_plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    db.delete(study_plan)
    db.commit()

    return {"message": "Study plan deleted successfully"}