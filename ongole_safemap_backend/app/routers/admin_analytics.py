from fastapi import APIRouter, Depends

from app.database import (
    incidents_collection, zones_collection, reports_collection,
    landmarks_collection, safety_tips_collection, audit_log_collection,
)
from app.auth.dependencies import get_current_admin
from app.schemas.common import DashboardStats
from app.utils.recompute_zones import recompute_all_zones
from app.utils.audit import log_action
from app.services.zone_service import zone_service

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])


def serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(admin: dict = Depends(get_current_admin)):
    total_incidents = await incidents_collection.count_documents({"exclusion_reason": None})
    zones = await zone_service.get_all_zones()
    total_zones = len(zones)
    zones_with_data = len([z for z in zones if z["crime_score"]["total_incidents"] > 0])

    pending = await reports_collection.count_documents({"status": "pending"})
    approved = await reports_collection.count_documents({"status": "approved"})
    rejected = await reports_collection.count_documents({"status": "rejected"})

    total_landmarks = await landmarks_collection.count_documents({})
    total_safety_tips = await safety_tips_collection.count_documents({})

    pipeline = [
        {"$match": {"exclusion_reason": None, "crime_category": {"$ne": None}}},
        {"$group": {"_id": "$crime_category", "count": {"$sum": 1}}},
    ]
    category_counts = {doc["_id"]: doc["count"] async for doc in incidents_collection.aggregate(pipeline)}

    recent_actions = []
    cursor = audit_log_collection.find({}).sort("timestamp", -1).limit(10)
    async for doc in cursor:
        recent_actions.append(serialize(doc))

    return DashboardStats(
        total_incidents=total_incidents,
        total_zones=total_zones,
        zones_with_data=zones_with_data,
        pending_reports=pending,
        approved_reports=approved,
        rejected_reports=rejected,
        total_landmarks=total_landmarks,
        total_safety_tips=total_safety_tips,
        category_breakdown=category_counts,
        recent_admin_actions=recent_actions,
    )
@router.post("/recompute-zones")
async def recompute_zones(admin: dict = Depends(get_current_admin)):
    result = await recompute_all_zones()

    await log_action(
        admin["email"],
        "recompute_zones",
        "zones",
        "all",
        details=result,
    )

    return result