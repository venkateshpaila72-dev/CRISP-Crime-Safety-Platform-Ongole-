from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReportOut(BaseModel):
    id: str = Field(alias="_id")
    reporter_name: str
    description: str
    category: str
    zone: Optional[str] = None
    latitude: float
    longitude: float
    status: str
    submitted_at: datetime
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class ReportReviewAction(BaseModel):
    action: str  # "approve" or "reject"

from typing import Optional


class ZoneOut(BaseModel):
    zone_id: str
    name: str
    latitude: float
    longitude: float
    polygon_geojson: Optional[dict] = None
    boundary_note: Optional[str] = None
    crime_score: dict
    last_updated: datetime


class LandmarkOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    type: str
    zone: str
    latitude: float
    longitude: float

    class Config:
        populate_by_name = True


class SafetyTipOut(BaseModel):
    id: str = Field(alias="_id")
    category: str
    tip: str

    class Config:
        populate_by_name = True


class TransparencyOut(BaseModel):
    total_incidents: int
    date_range: dict
    sources: list[str]
    zones_covered: int
    note: str

from enum import Enum


class CrimeCategory(str, Enum):
    assault = "Assault"
    burglary = "Burglary"
    chain_snatching = "Chain Snatching"
    harassment = "Harassment"
    murder = "Murder"
    robbery = "Robbery"
    theft = "Theft"
    vehicle_theft = "Vehicle Theft"
    other = "Other"


class ReportSubmission(BaseModel):
    reporter_name: str = Field(default="Anonymous", max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    category: CrimeCategory
    zone: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class ReportSubmissionOut(BaseModel):
    id: str = Field(alias="_id")
    status: str
    submitted_at: datetime

    class Config:
        populate_by_name = True


class IncidentOut(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    jurisdiction: Optional[str] = None
    crime_category: Optional[str] = None
    severity: Optional[str] = None
    time_of_day: Optional[str] = None
    published_date: Optional[datetime] = None
    source_name: Optional[str] = None
    is_crime_related: bool
    is_ongole_related: bool
    exclusion_reason: Optional[str] = None
    source: str

    class Config:
        populate_by_name = True


class IncidentUpdate(BaseModel):
    jurisdiction: Optional[str] = None
    crime_category: Optional[str] = None
    severity: Optional[str] = None
    time_of_day: Optional[str] = None
    is_crime_related: Optional[bool] = None
    is_ongole_related: Optional[bool] = None
    exclusion_reason: Optional[str] = None

class LandmarkCreate(BaseModel):
    name: str
    type: str
    zone: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class LandmarkUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SafetyTipCreate(BaseModel):
    category: str
    tip: str = Field(..., min_length=5, max_length=500)


class SafetyTipUpdate(BaseModel):
    category: Optional[str] = None
    tip: Optional[str] = None

class AuditLogOut(BaseModel):
    id: str = Field(alias="_id")
    admin_email: str
    action: str
    target_collection: str
    target_id: str
    details: Optional[dict] = None
    timestamp: datetime

    class Config:
        populate_by_name = True


class DashboardStats(BaseModel):
    total_incidents: int
    total_zones: int
    zones_with_data: int
    pending_reports: int
    approved_reports: int
    rejected_reports: int
    total_landmarks: int
    total_safety_tips: int
    category_breakdown: dict
    recent_admin_actions: list[AuditLogOut]


class IncidentPublicOut(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    crime_category: Optional[str] = None
    severity: Optional[str] = None
    time_of_day: Optional[str] = None
    published_date: Optional[datetime] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        populate_by_name = True