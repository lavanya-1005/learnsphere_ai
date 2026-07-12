import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.dependencies import require_instructor_or_admin
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["Uploads"])

UPLOAD_DIR = "uploads/content"

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
CHUNK_SIZE = 1024 * 1024  # 1 MB

ALLOWED_EXTENSIONS = {
    ".mp4",
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".txt",
    ".docx",
}

ALLOWED_CONTENT_TYPES = {
    "video/mp4",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/content")
def upload_course_content(
    file: UploadFile = File(...),
    current_user: User = Depends(require_instructor_or_admin),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    original_filename = file.filename or ""
    _, extension = os.path.splitext(original_filename)
    extension = extension.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file content type.",
        )

    safe_filename = f"{uuid4()}{extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    uploaded_size = 0

    try:
        with open(file_path, "wb") as buffer:
            while True:
                chunk = file.file.read(CHUNK_SIZE)

                if not chunk:
                    break

                uploaded_size += len(chunk)

                if uploaded_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File size must not exceed 100 MB.",
                    )

                buffer.write(chunk)

    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise

    finally:
        file.file.close()

    return {
        "message": "File uploaded successfully.",
        "filename": safe_filename,
        "content_type": file.content_type,
        "size_bytes": uploaded_size,
        "url": f"/uploads/content/{safe_filename}",
    }