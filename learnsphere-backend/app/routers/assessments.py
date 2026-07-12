from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.assessment import Assessment
from app.models.attempt import Attempt
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.question import Question
from app.models.user import User
from app.models.attempt_answer import AttemptAnswer
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse,
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    AttemptSubmit,
    AttemptResponse,
    AttemptAnswerResponse
)

router = APIRouter(tags=["Assessments"])

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

def is_course_owner_or_admin(course: Course, user: User):
    role = get_role(user)
    return role == "admin" or course.instructor_id == user.id

def is_enrolled_student(db: Session, course_id: int, user: User):
    role = get_role(user)

    if role != "student":
        return False

    return db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id,
        Enrollment.status == "active"
    ).first() is not None

@router.post("/courses/{course_id}/assessments", response_model=AssessmentResponse)
def create_assessment(
    course_id: int,
    request: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not is_course_owner_or_admin(course, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can create assessments"
        )

    assessment = Assessment(
        course_id=course_id,
        title=request.title,
        total_marks=0
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment

@router.put("/assessments/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: int,
    request: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    course = db.query(Course).filter(Course.id == assessment.course_id).first()

    if not is_course_owner_or_admin(course, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can update assessments"
        )

    if request.title is not None:
        assessment.title = request.title

    db.commit()
    db.refresh(assessment)

    return assessment

@router.delete("/assessments/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    course = db.query(Course).filter(Course.id == assessment.course_id).first()

    if not is_course_owner_or_admin(course, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can delete assessments"
        )

    questions = db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()

    for question in questions:
        db.delete(question)

    attempts = db.query(Attempt).filter(
        Attempt.assessment_id == assessment_id
    ).all()

    for attempt in attempts:
        db.delete(attempt)

    db.delete(assessment)
    db.commit()

    return {"message": "Assessment deleted successfully"}

@router.post("/assessments/{assessment_id}/questions", response_model=QuestionResponse)
def add_question(
    assessment_id: int,
    request: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    course = db.query(Course).filter(Course.id == assessment.course_id).first()

    if not is_course_owner_or_admin(course, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can add questions"
        )

    question = Question(
        assessment_id=assessment_id,
        question=request.question,
        option_a=request.option_a,
        option_b=request.option_b,
        option_c=request.option_c,
        option_d=request.option_d,
        answer=request.answer,
        marks=request.marks
    )

    assessment.total_marks += request.marks

    db.add(question)
    db.commit()
    db.refresh(question)

    return question

@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    request: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = db.query(Question).filter(Question.id == question_id).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    assessment = db.query(Assessment).filter(
        Assessment.id == question.assessment_id
    ).first()

    course = db.query(Course).filter(Course.id == assessment.course_id).first()

    if not is_course_owner_or_admin(course, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can update questions"
        )

    old_marks = question.marks

    if request.question is not None:
        question.question = request.question

    if request.option_a is not None:
        question.option_a = request.option_a

    if request.option_b is not None:
        question.option_b = request.option_b

    if request.option_c is not None:
        question.option_c = request.option_c

    if request.option_d is not None:
        question.option_d = request.option_d

    if request.answer is not None:
        question.answer = request.answer

    if request.marks is not None:
        question.marks = request.marks
        assessment.total_marks = assessment.total_marks - old_marks + request.marks

    db.commit()
    db.refresh(question)

    return question

@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = db.query(Question).filter(Question.id == question_id).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    assessment = db.query(Assessment).filter(
        Assessment.id == question.assessment_id
    ).first()

    course = db.query(Course).filter(Course.id == assessment.course_id).first()

    if not is_course_owner_or_admin(course, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only course owner or admin can delete questions"
        )

    assessment.total_marks -= question.marks

    if assessment.total_marks < 0:
        assessment.total_marks = 0

    db.delete(question)
    db.commit()

    return {"message": "Question deleted successfully"}

@router.get("/courses/{course_id}/assessments", response_model=list[AssessmentResponse])
def get_course_assessments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    role = get_role(current_user)

    allowed = (
        role == "admin"
        or course.instructor_id == current_user.id
        or is_enrolled_student(db, course_id, current_user)
    )

    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view assessments for this course"
        )

    return db.query(Assessment).filter(
        Assessment.course_id == course_id
    ).order_by(Assessment.created_at.desc()).all()

@router.get("/assessments/{assessment_id}/questions", response_model=list[QuestionResponse])
def get_assessment_questions(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    course = db.query(Course).filter(Course.id == assessment.course_id).first()

    role = get_role(current_user)

    allowed = (
        role == "admin"
        or course.instructor_id == current_user.id
        or is_enrolled_student(db, course.id, current_user)
    )

    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view questions"
        )

    return db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()

@router.post("/assessments/{assessment_id}/attempt", response_model=AttemptResponse)
def attempt_assessment(
    assessment_id: int,
    request: AttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if not is_enrolled_student(db, assessment.course_id, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only enrolled students can attempt assessment"
        )

    existing_attempt = db.query(Attempt).filter(
        Attempt.user_id == current_user.id,
        Attempt.assessment_id == assessment_id
    ).first()

    if existing_attempt:
        raise HTTPException(
            status_code=400,
            detail="You have already attempted this assessment"
        )

    questions = db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()

    question_map = {question.id: question for question in questions}
    score = 0

    for submitted_answer in request.answers:
        question = question_map.get(submitted_answer.question_id)

        if question and question.answer == submitted_answer.answer:
            score += question.marks

    percentage = 0

    if assessment.total_marks > 0:
        percentage = (score / assessment.total_marks) * 100

    result = "pass" if percentage >= 40 else "fail"

    attempt = Attempt(
        user_id=current_user.id,
        assessment_id=assessment_id,
        score=score,
        percentage=percentage,
        result=result,
        status="completed"
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    for submitted_answer in request.answers:
        question = question_map.get(submitted_answer.question_id)

        if question:
            is_correct = question.answer == submitted_answer.answer
            marks_awarded = question.marks if is_correct else 0

            attempt_answer = AttemptAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected_answer=submitted_answer.answer,
                correct_answer=question.answer,
                is_correct=is_correct,
                marks_awarded=marks_awarded
            )

            db.add(attempt_answer)

    db.commit()

    return attempt

@router.get("/users/me/attempts", response_model=list[AttemptResponse])
def get_my_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Attempt).filter(
        Attempt.user_id == current_user.id
    ).order_by(Attempt.created_at.desc()).all()

@router.get("/attempts/{attempt_id}/answers", response_model=list[AttemptAnswerResponse])
def get_attempt_answers(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    role = get_role(current_user)

    if role == "student" and attempt.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own attempt answers"
        )

    if role == "instructor":
        assessment = db.query(Assessment).filter(
            Assessment.id == attempt.assessment_id
        ).first()

        course = db.query(Course).filter(
            Course.id == assessment.course_id
        ).first()

        if course.instructor_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to view this attempt"
            )

    return db.query(AttemptAnswer).filter(
        AttemptAnswer.attempt_id == attempt_id
    ).all()