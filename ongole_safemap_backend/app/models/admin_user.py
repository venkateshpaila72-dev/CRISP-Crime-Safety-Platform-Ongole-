from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminUser(BaseModel):
    email: EmailStr
    hashed_password: str
    created_at: datetime