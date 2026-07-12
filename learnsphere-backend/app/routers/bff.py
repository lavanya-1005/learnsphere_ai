from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.assessment import Assessment
from app.models.attempt import Attempt
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson
from app.models.lesson_progress import LessonProgress
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.user import User
from app.models.wallet import Wallet

router = APIRouter(prefix="/bff", tags=["Backend For Frontend"])

def get_role(user: User):
    return (
        user.role.value
        if hasattr(user.role, "value")
        else user.role
    )

def user_data(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": get_role(user),
        "kyc_status": user.kyc_status
    }

def recent_notifications(
    db: Session,
    user_id: int
):
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(
        Notification.created_at.desc()
    ).limit(5).all()

    return [
        {
            "id": item.id,
            "type": item.type,
            "message": item.message,
            "is_read": item.is_read,
            "created_at": item.created_at
        }
        for item in notifications
    ]

@router.get("/student/dashboard")
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if get_role(current_user) != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.status == "active"
    ).all()

    course_ids = [
        enrollment.course_id
        for enrollment in enrollments
    ]

    lessons = []

    if course_ids:
        lessons = db.query(Lesson).filter(
            Lesson.course_id.in_(course_ids)
        ).all()

    lesson_ids = [lesson.id for lesson in lessons]

    completed_lessons = 0

    if lesson_ids:
        completed_lessons = db.query(
            LessonProgress
        ).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id.in_(lesson_ids)
        ).count()

    assessments = []

    if course_ids:
        assessments = db.query(Assessment).filter(
            Assessment.course_id.in_(course_ids)
        ).all()

    assessment_ids = [
        assessment.id
        for assessment in assessments
    ]

    attempts = 0
    passed_assessments = 0

    if assessment_ids:
        attempts = db.query(Attempt).filter(
            Attempt.user_id == current_user.id,
            Attempt.assessment_id.in_(assessment_ids)
        ).count()

        passed_assessments = db.query(Attempt).filter(
            Attempt.user_id == current_user.id,
            Attempt.assessment_id.in_(assessment_ids),
            Attempt.result == "pass"
        ).count()

    certificates = db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).count()

    unread_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()

    return {
        "user": user_data(current_user),
        "summary": {
            "enrolled_courses": len(enrollments),
            "total_lessons": len(lessons),
            "completed_lessons": completed_lessons,
            "total_assessments": len(assessments),
            "attempted_assessments": attempts,
            "passed_assessments": passed_assessments,
            "certificates": certificates,
            "unread_notifications": unread_notifications,
            "wallet_balance": float(wallet.balance) if wallet else 0
        },
        "recent_notifications": recent_notifications(
            db,
            current_user.id
        )
    }

@router.get("/instructor/dashboard")
def instructor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if get_role(current_user) != "instructor":
        raise HTTPException(
            status_code=403,
            detail="Instructor access required"
        )

    courses = db.query(Course).filter(
        Course.instructor_id == current_user.id
    ).all()

    course_ids = [course.id for course in courses]

    total_lessons = 0
    total_assessments = 0
    total_enrollments = 0
    total_attempts = 0

    if course_ids:
        total_lessons = db.query(Lesson).filter(
            Lesson.course_id.in_(course_ids)
        ).count()

        assessments = db.query(Assessment).filter(
            Assessment.course_id.in_(course_ids)
        ).all()

        assessment_ids = [
            assessment.id
            for assessment in assessments
        ]

        total_assessments = len(assessments)

        total_enrollments = db.query(Enrollment).filter(
            Enrollment.course_id.in_(course_ids)
        ).count()

        if assessment_ids:
            total_attempts = db.query(Attempt).filter(
                Attempt.assessment_id.in_(assessment_ids)
            ).count()

    unread_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {
        "user": user_data(current_user),
        "summary": {
            "courses": len(courses),
            "lessons": total_lessons,
            "assessments": total_assessments,
            "enrollments": total_enrollments,
            "student_attempts": total_attempts,
            "unread_notifications": unread_notifications,
            "kyc_status": current_user.kyc_status
        },
        "recent_notifications": recent_notifications(
            db,
            current_user.id
        )
    }

@router.get("/admin/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if get_role(current_user) != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return {
        "user": user_data(current_user),
        "summary": {
            "total_users": db.query(User).count(),
            "students": db.query(User).filter(
                User.role == "student"
            ).count(),
            "instructors": db.query(User).filter(
                User.role == "instructor"
            ).count(),
            "courses": db.query(Course).count(),
            "enrollments": db.query(Enrollment).count(),
            "payments": db.query(Payment).count(),
            "certificates": db.query(Certificate).count(),
            "pending_kyc": db.query(User).filter(
                User.role == "instructor",
                User.kyc_status == "submitted"
            ).count()
        },
        "recent_notifications": recent_notifications(
            db,
            current_user.id
        )
    }