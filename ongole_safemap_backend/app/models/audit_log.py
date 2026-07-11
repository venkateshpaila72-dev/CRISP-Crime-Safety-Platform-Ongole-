from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AuditLog(BaseModel):
    admin_email: str
    action: str          # e.g. "approve_report", "delete_incident", "edit_landmark"
    target_collection: str
    target_id: str
    details: Optional[dict] = None
    timestamp: datetime