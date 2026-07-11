from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CrimeScore(BaseModel):
    raw_weighted_score: Optional[float] = None
    total_incidents: int
    high_severity_pct: float
    risk_label: str
    confidence: str
    category_breakdown: dict[str, int] = {}


class Zone(BaseModel):
    zone_id: str
    name: str
    # Center point is the reliable source of truth for map placement — always required.
    # polygon_geojson is an optional upgrade: when present, the frontend renders the
    # real drawn boundary; when absent, it falls back to a circle at (latitude, longitude).
    # This means the map never breaks, and real boundaries can be added later with zero
    # changes anywhere else in the system.
    latitude: float
    longitude: float
    polygon_geojson: Optional[dict] = None
    boundary_note: Optional[str] = None
    crime_score: CrimeScore
    source: str = "seed"
    last_updated: datetime