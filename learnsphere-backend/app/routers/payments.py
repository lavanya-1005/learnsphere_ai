from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.payment import WalletTopupRequest, WalletResponse, PaymentResponse

router = APIRouter(prefix="/payments", tags=["Payments"])

def get_or_create_wallet(db: Session, user_id: int):
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

    if wallet:
        return wallet

    wallet = Wallet(user_id=user_id, balance=Decimal("0.00"))
    db.add(wallet)
    db.commit()
    db.refresh(wallet)

    return wallet

@router.get("/wallet", response_model=WalletResponse)
def get_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_or_create_wallet(db, current_user.id)

@router.post("/wallet/topup", response_model=PaymentResponse)
def topup_wallet(
    request: WalletTopupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wallet = get_or_create_wallet(db, current_user.id)
    wallet.balance += request.amount

    payment = Payment(
        user_id=current_user.id,
        course_id=None,
        amount=request.amount,
        txn_id="TXN-" + str(uuid4()),
        status="success",
        type="wallet_topup"
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment

@router.post("/courses/{course_id}/buy", response_model=PaymentResponse)
def buy_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can buy courses")

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(status_code=400, detail="You are already enrolled in this course")

    wallet = get_or_create_wallet(db, current_user.id)

    if wallet.balance < course.price:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    wallet.balance -= course.price

    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id,
        status="active"
    )

    payment = Payment(
        user_id=current_user.id,
        course_id=course_id,
        amount=course.price,
        txn_id="TXN-" + str(uuid4()),
        status="success",
        type="course_purchase"
    )

    db.add(enrollment)
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment

@router.get("/history", response_model=list[PaymentResponse])
def payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()