from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Incident(BaseModel):
    title: str
    description: str
    jurisdiction: Optional[str] = None
    crime_category: Optional[str] = None
    severity: Optional[str] = None
    time_of_day: Optional[str] = None
    published_date: Optional[datetime] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    is_crime_related: bool
    is_ongole_related: bool
    exclusion_reason: Optional[str] = None
    source: str = "seed"  # "seed" | "scraper" | "backfill"