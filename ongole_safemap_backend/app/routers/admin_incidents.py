from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.database import incidents_collection
from app.auth.dependencies import get_current_admin
from app.schemas.common import IncidentOut, IncidentUpdate
from app.utils.audit import log_action

router = APIRouter(prefix="/admin/incidents", tags=["admin-incidents"])


def serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("", response_model=list[IncidentOut])
async def list_incidents(
    excluded_only: bool = Query(False, description="Show only excluded/filtered-out incidents"),
    jurisdiction: str | None = None,
    crime_category: str | None = None,
    admin: dict = Depends(get_current_admin),
):
    query = {}
    if excluded_only:
        query["exclusion_reason"] = {"$ne": None}
    else:
        query["exclusion_reason"] = None
    if jurisdiction:
        query["jurisdiction"] = jurisdiction
    if crime_category:
        query["crime_category"] = crime_category

    cursor = incidents_collection.find(query)
    return [serialize(doc) async for doc in cursor]


@router.get("/{incident_id}", response_model=IncidentOut)
async def get_incident(incident_id: str, admin: dict = Depends(get_current_admin)):
    try:
        obj_id = ObjectId(incident_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid incident_id")

    doc = await incidents_collection.find_one({"_id": obj_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return serialize(doc)


@router.patch("/{incident_id}", response_model=IncidentOut)
async def update_incident(
    incident_id: str,
    update: IncidentUpdate,
    admin: dict = Depends(get_current_admin),
):
    try:
        obj_id = ObjectId(incident_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid incident_id")

    changes = update.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await incidents_collection.find_one_and_update(
        {"_id": obj_id},
        {"$set": changes},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    await log_action(admin["email"], "update_incident", "incidents", incident_id, details=changes)

    return serialize(result)


@router.delete("", status_code=200)
async def bulk_delete_incidents(
    source: str | None = Query(None, description="Delete only incidents with this source value, e.g. 'seed' or 'scraper'"),
    excluded_only: bool = Query(False, description="Delete only excluded/noise incidents (exclusion_reason is not null)"),
    admin: dict = Depends(get_current_admin),
):
    query = {}
    if source:
        query["source"] = source
    if excluded_only:
        query["exclusion_reason"] = {"$ne": None}

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Refusing to delete all incidents without a filter. Provide 'source' and/or 'excluded_only=true'.",
        )

    result = await incidents_collection.delete_many(query)

    await log_action(
        admin["email"], "bulk_delete_incidents", "incidents", "bulk",
        details={"filter": query, "deleted_count": result.deleted_count},
    )

    return {"deleted_count": result.deleted_count, "filter_used": query}


@router.delete("/{incident_id}", status_code=204)
async def delete_incident(incident_id: str, admin: dict = Depends(get_current_admin)):
    try:
        obj_id = ObjectId(incident_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid incident_id")

    result = await incidents_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")

    await log_action(admin["email"], "delete_incident", "incidents", incident_id)