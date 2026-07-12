import os

from fastapi import APIRouter, Depends, HTTPException
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
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
from app.models.user import User
from app.schemas.certificate import CertificateResponse

router = APIRouter(prefix="/certificates", tags=["Certificates"])

def generate_certificate_pdf(student_name: str, course_title: str, certificate_id: int):
    os.makedirs("uploads/certificates", exist_ok=True)

    file_name = f"certificate_{certificate_id}.pdf"
    file_path = os.path.join("uploads/certificates", file_name)

    c = canvas.Canvas(file_path, pagesize=landscape(A4))
    width, height = landscape(A4)

    c.setStrokeColor(colors.HexColor("#1e3a8a"))
    c.setLineWidth(6)
    c.rect(30, 30, width - 60, height - 60)

    c.setFont("Helvetica-Bold", 34)
    c.setFillColor(colors.HexColor("#1e3a8a"))
    c.drawCentredString(width / 2, height - 120, "Certificate of Completion")

    c.setFont("Helvetica", 18)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 180, "This certificate is proudly presented to")

    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width / 2, height - 240, student_name)

    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 300, "for successfully completing the course")

    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(colors.HexColor("#4f46e5"))
    c.drawCentredString(width / 2, height - 355, course_title)

    c.setFont("Helvetica", 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, 110, "Issued by LearnSphere AI")

    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, 80, f"Certificate ID: {certificate_id}")

    c.save()

    return f"/uploads/certificates/{file_name}"

@router.post("/courses/{course_id}", response_model=CertificateResponse)
def generate_certificate(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can generate certificates")

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.status == "active"
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).all()

    lesson_ids = [lesson.id for lesson in lessons]

    completed_lessons = 0

    if lesson_ids:
        completed_lessons = db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id.in_(lesson_ids)
        ).count()

    if completed_lessons < len(lesson_ids):
        raise HTTPException(
            status_code=400,
            detail="You must complete all lessons to generate certificate"
        )

    assessments = db.query(Assessment).filter(
        Assessment.course_id == course_id
    ).all()

    if not assessments:
        raise HTTPException(
            status_code=400,
            detail="No assessments found for this course"
        )

    passed_assessment_ids = {
        attempt.assessment_id
        for attempt in db.query(Attempt).filter(
            Attempt.user_id == current_user.id,
            Attempt.result == "pass"
        ).all()
    }

    required_assessment_ids = {assessment.id for assessment in assessments}

    if not required_assessment_ids.issubset(passed_assessment_ids):
        raise HTTPException(
            status_code=400,
            detail="You must pass all course assessments to generate certificate"
        )

    existing_certificate = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.course_id == course_id
    ).first()

    if existing_certificate:
        return existing_certificate

    certificate = Certificate(
        user_id=current_user.id,
        course_id=course_id,
        url="pending"
    )

    db.add(certificate)
    db.commit()
    db.refresh(certificate)

    certificate_url = generate_certificate_pdf(
        student_name=current_user.name,
        course_title=course.title,
        certificate_id=certificate.id
    )

    certificate.url = certificate_url

    notification = Notification(
        user_id=current_user.id,
        type="certificate",
        message=f"Your certificate for course {course_id} has been generated."
    )

    db.add(notification)
    db.commit()
    db.refresh(certificate)

    return certificate

@router.get("/me", response_model=list[CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).order_by(Certificate.issued_at.desc()).all()