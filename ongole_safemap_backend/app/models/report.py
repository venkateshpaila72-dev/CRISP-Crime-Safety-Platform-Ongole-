from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Report(BaseModel):
    reporter_name: str = "Anonymous"
    description: str
    category: str
    zone: Optional[str] = None
    latitude: float
    longitude: float
    status: str = "pending"  # "pending" | "approved" | "rejected"
    submitted_at: datetime
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None