from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.database import (
    landmarks_collection,
    safety_tips_collection,
    incidents_collection,
    reports_collection,
)

from app.schemas.common import (
    ZoneOut,
    LandmarkOut,
    SafetyTipOut,
    TransparencyOut,
    IncidentPublicOut,
    ReportSubmission,
    ReportSubmissionOut,
)

from app.services.zone_service import zone_service

router = APIRouter(
    prefix="",
    tags=["public"],
)


def serialize(doc: dict):

    doc["_id"] = str(doc["_id"])

    return doc


# ============================================================
# ZONES
# ============================================================

@router.get(
    "/zones",
    response_model=list[ZoneOut],
)
async def list_zones():

    return await zone_service.get_all_zones()


@router.get(
    "/zones/{zone_id}",
    response_model=ZoneOut,
)
async def get_zone(
    zone_id: str,
):

    zone = await zone_service.get_zone(
        zone_id
    )

    if zone is None:

        raise HTTPException(
            status_code=404,
            detail="Zone not found",
        )

    return zone


@router.get(
    "/zones/{zone_id}/incidents",
    response_model=list[IncidentPublicOut],
)
async def list_zone_incidents(
    zone_id: str,
    limit: int = 20,
):

    zone = await zone_service.get_zone(
        zone_id
    )

    if zone is None:

        raise HTTPException(
            status_code=404,
            detail="Zone not found",
        )

    return await zone_service.get_zone_incidents(
        zone["name"],
        limit,
    )


# ============================================================
# HEATMAP
# ============================================================

@router.get("/heatmap")
async def heatmap():

    return await zone_service.heatmap()


# ============================================================
# REBUILD
# ============================================================

@router.post("/zones/rebuild")
async def rebuild():

    return await zone_service.rebuild()


# ============================================================
# REFRESH
# ============================================================

@router.post("/zones/refresh")
async def refresh():

    return await zone_service.refresh()


# ============================================================
# LANDMARKS
# ============================================================

@router.get(
    "/landmarks",
    response_model=list[LandmarkOut],
)
async def list_landmarks(
    zone: str | None = None,
    type: str | None = None,
):

    query = {}

    if zone:

        query["zone"] = zone

    if type:

        query["type"] = type

    cursor = landmarks_collection.find(
        query
    )

    return [
        serialize(doc)

        async for doc in cursor
    ]


# ============================================================
# SAFETY TIPS
# ============================================================

@router.get(
    "/safety-tips",
    response_model=list[SafetyTipOut],
)
async def list_safety_tips(
    category: str | None = None,
):

    query = {}

    if category:

        query["category"] = category

    cursor = safety_tips_collection.find(
        query
    )

    return [
        serialize(doc)

        async for doc in cursor
    ]


# ============================================================
# TRANSPARENCY
# ============================================================

@router.get(
    "/transparency",
    response_model=TransparencyOut,
)
async def transparency():

    total = await incidents_collection.count_documents(
        {}
    )

    if total == 0:

        return TransparencyOut(
            total_incidents=0,
            date_range={
                "earliest": None,
                "latest": None,
            },
            sources=[],
            zones_covered=0,
            note="No incidents found.",
        )

    pipeline = [
        {
            "$group": {
                "_id": None,
                "earliest": {
                    "$min": "$published_date"
                },
                "latest": {
                    "$max": "$published_date"
                },
                "sources": {
                    "$addToSet": "$source_name"
                },
                "zones": {
                    "$addToSet": "$jurisdiction"
                },
            }
        }
    ]

    result = await incidents_collection.aggregate(
        pipeline
    ).to_list(1)

    agg = result[0]

    return TransparencyOut(

        total_incidents=total,

        date_range={
            "earliest": (
                agg["earliest"].isoformat()
                if agg["earliest"]
                else None
            ),
            "latest": (
                agg["latest"].isoformat()
                if agg["latest"]
                else None
            ),
        },

        sources=agg["sources"],

        zones_covered=len(
            [
                z

                for z in agg["zones"]

                if z
            ]
        ),

        note="Automatically generated from MongoDB.",
    )


# ============================================================
# REPORT INCIDENT
# ============================================================

@router.post(
    "/report-incident",
    response_model=ReportSubmissionOut,
    status_code=201,
)
async def submit_report(
    report: ReportSubmission,
):

    doc = {

        "reporter_name":
            report.reporter_name
            or "Anonymous",

        "description":
            report.description,

        "category":
            report.category.value,

        "zone":
            report.zone,

        "latitude":
            report.latitude,

        "longitude":
            report.longitude,

        "status":
            "pending",

        "submitted_at":
            datetime.utcnow(),

        "reviewed_by":
            None,

        "reviewed_at":
            None,
    }

    result = await reports_collection.insert_one(
        doc
    )

    doc["_id"] = str(
        result.inserted_id
    )

    return doc