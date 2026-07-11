from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from app.database import landmarks_collection, safety_tips_collection, zones_collection
from app.auth.dependencies import get_current_admin
from app.services.zone_service import zone_service
from app.schemas.common import (
    LandmarkOut, LandmarkCreate, LandmarkUpdate,
    SafetyTipOut, SafetyTipCreate, SafetyTipUpdate,
)
from app.utils.audit import log_action

router = APIRouter(prefix="/admin/content", tags=["admin-content"])


def serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


def parse_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")


# ---------- Landmarks ----------

@router.post("/landmarks", response_model=LandmarkOut, status_code=201)
async def create_landmark(landmark: LandmarkCreate, admin: dict = Depends(get_current_admin)):
    doc = {**landmark.model_dump(), "source": "admin"}
    result = await landmarks_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    await log_action(admin["email"], "create_landmark", "landmarks", str(result.inserted_id))

    return doc


@router.patch("/landmarks/{landmark_id}", response_model=LandmarkOut)
async def update_landmark(landmark_id: str, update: LandmarkUpdate, admin: dict = Depends(get_current_admin)):
    obj_id = parse_object_id(landmark_id)
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await landmarks_collection.find_one_and_update(
        {"_id": obj_id}, {"$set": changes}, return_document=True,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Landmark not found")

    await log_action(admin["email"], "update_landmark", "landmarks", landmark_id, details=changes)

    return serialize(result)


@router.delete("/landmarks/{landmark_id}", status_code=204)
async def delete_landmark(landmark_id: str, admin: dict = Depends(get_current_admin)):
    obj_id = parse_object_id(landmark_id)
    result = await landmarks_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Landmark not found")

    await log_action(admin["email"], "delete_landmark", "landmarks", landmark_id)


# ---------- Safety Tips ----------

@router.post("/safety-tips", response_model=SafetyTipOut, status_code=201)
async def create_safety_tip(tip: SafetyTipCreate, admin: dict = Depends(get_current_admin)):
    doc = tip.model_dump()
    result = await safety_tips_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    await log_action(admin["email"], "create_safety_tip", "safety_tips", str(result.inserted_id))

    return doc


@router.patch("/safety-tips/{tip_id}", response_model=SafetyTipOut)
async def update_safety_tip(tip_id: str, update: SafetyTipUpdate, admin: dict = Depends(get_current_admin)):
    obj_id = parse_object_id(tip_id)
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await safety_tips_collection.find_one_and_update(
        {"_id": obj_id}, {"$set": changes}, return_document=True,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Safety tip not found")

    await log_action(admin["email"], "update_safety_tip", "safety_tips", tip_id, details=changes)

    return serialize(result)


@router.delete("/safety-tips/{tip_id}", status_code=204)
async def delete_safety_tip(tip_id: str, admin: dict = Depends(get_current_admin)):
    obj_id = parse_object_id(tip_id)
    result = await safety_tips_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Safety tip not found")

    await log_action(admin["email"], "delete_safety_tip", "safety_tips", tip_id)


# ---------- Jurisdictions (read-only lookup) ----------

@router.get("/jurisdictions")
async def list_jurisdictions(admin: dict = Depends(get_current_admin)):
    zones = await zone_service.get_all_zones()
    return [{"zone_id": z["zone_id"], "name": z["name"]} for z in zones]