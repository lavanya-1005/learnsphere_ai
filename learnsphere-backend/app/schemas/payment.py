from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime

class WalletTopupRequest(BaseModel):
    amount: Decimal = Field(gt=0)

class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int | None
    amount: Decimal
    txn_id: str
    status: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True