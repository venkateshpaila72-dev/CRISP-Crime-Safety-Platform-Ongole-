from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db_name]

zones_collection = db["zones"]
landmarks_collection = db["landmarks"]
incidents_collection = db["incidents"]
reports_collection = db["reports"]
safety_tips_collection = db["safety_tips"]
admin_users_collection = db["admin_users"]
audit_log_collection = db["audit_log"]


async def ping_database() -> bool:
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False