from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import reports_collection
from app.auth.dependencies import get_current_admin
from app.schemas.common import ReportOut, ReportReviewAction
from app.utils.audit import log_action

router = APIRouter(prefix="/admin/reports", tags=["admin-reports"])


def serialize_report(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("", response_model=list[ReportOut])
async def list_reports(
    status_filter: str = "pending",
    admin: dict = Depends(get_current_admin),
):
    cursor = reports_collection.find({"status": status_filter})
    reports = [serialize_report(doc) async for doc in cursor]
    return reports


@router.patch("/{report_id}", response_model=ReportOut)
async def review_report(
    report_id: str,
    action: ReportReviewAction,
    admin: dict = Depends(get_current_admin),
):
    if action.action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="action must be 'approve' or 'reject'")

    try:
        obj_id = ObjectId(report_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid report_id")

    new_status = "approved" if action.action == "approve" else "rejected"
    result = await reports_collection.find_one_and_update(
        {"_id": obj_id},
        {"$set": {
            "status": new_status,
            "reviewed_by": admin["email"],
            "reviewed_at": datetime.now(timezone.utc),
        }},
        return_document=True,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Report not found")

    await log_action(admin["email"], f"report_{new_status}", "reports", report_id)

    return serialize_report(result)