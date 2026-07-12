from pydantic import BaseModel

class StudentCourseProgressResponse(BaseModel):
    course_id: int
    total_lessons: int
    completed_lessons: int
    total_assessments: int
    completed_attempts: int
    passed_assessments: int
    progress_percentage: float

class InstructorCourseAnalyticsResponse(BaseModel):
    course_id: int
    total_enrollments: int
    total_lessons: int
    total_assessments: int
    total_attempts: int
    average_score: float