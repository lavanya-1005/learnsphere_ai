import re

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_instructor_or_admin
from app.models.interview_question import InterviewQuestion
from app.models.mock_interview import MockInterview
from app.models.user import User
from app.schemas.interview import (
    InterviewQuestionCreate,
    InterviewQuestionResponse,
    MockInterviewRequest,
    MockInterviewResponse
)

router = APIRouter(prefix="/interviews", tags=["Interviews"])

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

def generate_interview_feedback(question: str, answer: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an interview evaluator for an EdTech platform. "
                    "Evaluate the student's answer. "
                    "Return feedback and a score out of 10. "
                    "Use this exact format: Score: <number>/10. Feedback: <feedback text>."
                )
            },
            {
                "role": "user",
                "content": f"Question: {question}\nStudent Answer: {answer}"
            }
        ],
        temperature=0.4
    )

    text = response.choices[0].message.content or ""
    return " ".join(text.split())

def extract_score(feedback: str):
    match = re.search(r"Score:\s*(\d+)", feedback)

    if not match:
        return 0

    score = int(match.group(1))

    if score < 0:
        return 0

    if score > 10:
        return 10

    return score

@router.post("/questions", response_model=InterviewQuestionResponse)
def create_interview_question(
    request: InterviewQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    question = InterviewQuestion(
        category=request.category,
        question=request.question,
        difficulty=request.difficulty
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question

@router.get("/questions", response_model=list[InterviewQuestionResponse])
def get_interview_questions(
    category: str | None = None,
    difficulty: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InterviewQuestion)

    if category:
        query = query.filter(InterviewQuestion.category == category)

    if difficulty:
        query = query.filter(InterviewQuestion.difficulty == difficulty)

    return query.order_by(InterviewQuestion.created_at.desc()).all()

@router.post("/mock", response_model=MockInterviewResponse)
def submit_mock_interview(
    request: MockInterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = get_role(current_user)

    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can attempt mock interviews")

    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == request.question_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Interview question not found")

    try:
        feedback = generate_interview_feedback(question.question, request.answer)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI interview feedback error: {str(error)}"
        )

    score = extract_score(feedback)

    mock_interview = MockInterview(
        user_id=current_user.id,
        question_id=question.id,
        answer=request.answer,
        feedback=feedback,
        score=score
    )

    db.add(mock_interview)
    db.commit()
    db.refresh(mock_interview)

    return mock_interview

@router.get("/me", response_model=list[MockInterviewResponse])
def get_my_mock_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(MockInterview).filter(
        MockInterview.user_id == current_user.id
    ).order_by(MockInterview.created_at.desc()).all()