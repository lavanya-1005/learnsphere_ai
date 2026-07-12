from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.core.database import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)
    content_url = Column(Text)
    order_no = Column(Integer, default=1)