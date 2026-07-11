from pydantic import BaseModel


class Landmark(BaseModel):
    name: str
    type: str  # "police_station" | "hospital" | "help_desk"
    zone: str
    latitude: float
    longitude: float
    source: str = "seed"