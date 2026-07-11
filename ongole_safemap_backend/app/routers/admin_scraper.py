from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_admin
from app.utils.audit import log_action
from app.scraper.daily_update import run_scraper

router = APIRouter(prefix="/admin/scraper", tags=["admin-scraper"])

_scraper_run_log: list[dict] = []  # in-memory for now; could move to Mongo later


@router.post("/trigger")
async def trigger_scrape(admin: dict = Depends(get_current_admin)):
    result = await run_scraper()
    run_record = {
        "triggered_by": admin["email"],
        "triggered_at": datetime.now(timezone.utc).isoformat(),
        **result,
    }
    _scraper_run_log.append(run_record)
    await log_action(admin["email"], "trigger_scraper", "scraper", "manual_trigger", details=result)
    return run_record


@router.get("/logs")
async def get_scraper_logs(admin: dict = Depends(get_current_admin)):
    return list(reversed(_scraper_run_log))