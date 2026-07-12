from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
from app.models import (
    user,
    course,
    enrollment,
    lesson,
    assessment,
    question,
    attempt,
    ai_chat,
    wallet,
    payment,
    certificate,
    notification,
    lesson_progress,
    attempt_answer,
    study_plan,
    interview_question,
    mock_interview,
)
from app.routers import (
    auth,
    users,
    courses,
    enrollments,
    lessons,
    assessments,
    ai_chat,
    payments,
    certificates,
    notifications,
    admin,
    analytics,
    lesson_progress,
    uploads,
    recommendations,
    study_plans,
    interviews,
    bff,
)

app = FastAPI(title="LearnSphere AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(uploads.router)
app.include_router(lessons.router)
app.include_router(ai_chat.router)
app.include_router(assessments.router)
app.include_router(payments.router)
app.include_router(certificates.router)
app.include_router(notifications.router)
app.include_router(recommendations.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(lesson_progress.router)
app.include_router(study_plans.router)
app.include_router(interviews.router)
app.include_router(bff.router)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

@app.get("/")
def home():
    return {
        "message": "LearnSphere AI backend is running"
    }