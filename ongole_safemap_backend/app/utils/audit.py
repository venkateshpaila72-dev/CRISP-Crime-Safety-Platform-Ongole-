from datetime import datetime, timezone
from app.database import audit_log_collection


async def log_action(admin_email: str, action: str, target_collection: str, target_id: str, details: dict | None = None):
    await audit_log_collection.insert_one({
        "admin_email": admin_email,
        "action": action,
        "target_collection": target_collection,
        "target_id": target_id,
        "details": details,
        "timestamp": datetime.now(timezone.utc),
    })