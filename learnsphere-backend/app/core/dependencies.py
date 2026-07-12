from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

def require_instructor_or_admin(
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only instructors or admins can perform this action"
        )

    return current_user

def require_admin(
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can perform this action"
        )

    return current_user