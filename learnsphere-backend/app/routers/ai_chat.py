from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.ai_chat import AIChat
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.ai_chat import AIChatRequest, AIChatResponse
from app.mcps.local_mcp import search_local_mcp

router = APIRouter(prefix="/ai", tags=["AI Tutor"])

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

def get_role(user: User):
    return user.role.value if hasattr(user.role, "value") else user.role

def student_is_enrolled(db: Session, user_id: int, course_id: int):
    return db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.course_id == course_id,
        Enrollment.status == "active"
    ).first() is not None

def is_allowed_ai_tutor_question(message: str):
    allowed_keywords = [
        "python", "java", "programming", "code", "coding",
        "variable", "loop", "function", "class", "object",
        "database", "sql", "mysql", "api", "backend", "frontend",
        "course", "lesson", "quiz", "assessment", "certificate",
        "payment", "wallet", "enrollment", "learn", "explain",
        "study", "assignment", "project", "error", "debug"
    ]

    message_lower = message.lower()

    return any(keyword in message_lower for keyword in allowed_keywords)

def generate_ai_response(message: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are LearnSphere AI Tutor for an EdTech platform. "
                    "Only answer questions related to education, programming, courses, lessons, assessments, certificates, projects, and platform learning support. "
                    "If the user asks unrelated questions about politics, celebrities, entertainment, sports, personal topics, or general news, reply exactly: "
                    "'I can only answer course-related, learning-related, programming-related, or LearnSphere platform-related questions.' "
                    "Explain allowed topics clearly, simply, and step by step."
                )
            },
            {
                "role": "user",
                "content": message
            }
        ],
        temperature=0.7
    )

    ai_text = response.choices[0].message.content or ""
    return ai_text.strip()

@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not is_allowed_ai_tutor_question(request.message):
        ai_response = "I can only answer course-related, learning-related, programming-related, or LearnSphere platform-related questions."
        source = "restricted"

        chat = AIChat(
            user_id=current_user.id,
            course_id=request.course_id,
            message=request.message,
            response=ai_response,
            source=source
        )

        db.add(chat)
        db.commit()
        db.refresh(chat)

        return chat

    if request.course_id is not None:
        course = db.query(Course).filter(Course.id == request.course_id).first()

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        role = get_role(current_user)

        if role == "student" and not student_is_enrolled(db, current_user.id, request.course_id):
            raise HTTPException(
                status_code=403,
                detail="You must be enrolled in this course to ask course-related questions"
            )

    local_result = search_local_mcp(request.message)

    if local_result:
        ai_response = local_result["answer"]
        source = "local_mcp"
    else:
        try:
            ai_response = generate_ai_response(request.message)
            source = "groq_ai"
        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"AI Tutor error: {str(error)}"
            )

    chat = AIChat(
    user_id=current_user.id,
    course_id=request.course_id,
    message=request.message,
    response=ai_response,
    source=source
    )
    
    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat

@router.get("/chats", response_model=list[AIChatResponse])
def get_my_ai_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AIChat).filter(
        AIChat.user_id == current_user.id
    ).order_by(AIChat.created_at.desc()).all()