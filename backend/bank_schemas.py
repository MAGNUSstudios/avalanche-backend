from pydantic import BaseModel, EmailStr
from typing import Optional

class BankAccountCreate(BaseModel):
    bank_name: str
    account_number: str
    account_holder_name: str
    routing_number: Optional[str] = None
    swift_code: Optional[str] = None
    country: str = "US"
