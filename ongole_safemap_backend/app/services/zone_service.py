from collections import defaultdict
from datetime import datetime

from app.database import incidents_collection
from app.services.geojson_service import geojson_service
from app.services.geocoding_service import geocoding_service
from app.utils.crime_score import calculate_zone_statistics, assign_risk_labels
from app.scraper.keywords_config import LOCALITY_COORDINATES

ONGOLE_TOWN_CENTER = {"latitude": 15.5057, "longitude": 80.0499}


class ZoneService:

    def __init__(self):
        pass

    async def load_incidents(self):
        cursor = incidents_collection.find({"exclusion_reason": None})
        incidents = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            incidents.append(doc)
        return incidents

    def group_by_locality(self, incidents):

        grouped = defaultdict(list)

        for incident in incidents:

            locality = (
                incident.get("jurisdiction")
                or incident.get("locality")
                or "Ongole (Citywide / Unspecified)"
            )

            grouped[locality].append(
                incident
        )

        return grouped

    def build_zone(self, locality, stats):
        coords = LOCALITY_COORDINATES.get(locality)
        if coords is None:
            cached = geocoding_service.get_cached(locality)
            coords = cached if cached else ONGOLE_TOWN_CENTER

        latitude = coords["latitude"]
        longitude = coords["longitude"]

        geojson_service.upsert_locality(locality, latitude, longitude)
        geojson_service.update_statistics(
            locality=locality,
            crime_score=stats["crime_score"],
            incident_count=stats["incident_count"],
            risk=stats["risk"],
            last_updated=datetime.utcnow(),
        )

        feature = geojson_service.get(locality)

        incident_count = stats["incident_count"]
        high_count = stats["severity_breakdown"].get("High", 0)
        high_severity_pct = round((high_count / incident_count) * 100, 1) if incident_count else 0.0

        if incident_count >= 15:
            confidence = "HIGH"
        elif incident_count >= 5:
            confidence = "MODERATE"
        elif incident_count > 0:
            confidence = "LOW (small sample)"
        else:
            confidence = "Insufficient"

        return {
            "zone_id": feature["properties"]["id"],
            "name": locality,
            "latitude": latitude,
            "longitude": longitude,
            "polygon_geojson": feature,
            "crime_score": {
                "raw_weighted_score": stats["crime_score"],
                "total_incidents": stats["incident_count"],
                "high_severity_pct": high_severity_pct,
                "risk_label": stats["risk"],
                "confidence": confidence,
                "category_breakdown": stats["category_breakdown"],
            },
            "last_updated": datetime.utcnow(),
        }

    async def get_all_zones(self):
        incidents = await self.load_incidents()
        grouped = self.group_by_locality(incidents)

        # Compute raw stats for every locality first, then assign risk
        # labels relative to each other — this is what actually fixes the
        # "everything shows grey" problem, since labels now reflect the
        # real spread of your data instead of arbitrary fixed thresholds.
        stats_by_locality = {
            locality: calculate_zone_statistics(incs)
            for locality, incs in grouped.items()
        }
        stats_by_locality = assign_risk_labels(stats_by_locality)

        zones = []
        for locality, stats in stats_by_locality.items():
            zone = self.build_zone(locality, stats)
            zones.append(zone)

        geojson_service.save()

        zones.sort(key=lambda z: (-z["crime_score"]["raw_weighted_score"], z["name"]))
        return zones

    async def get_zone(self, zone_id: str):
        zones = await self.get_all_zones()
        for zone in zones:
            if zone["zone_id"] == zone_id:
                return zone
        return None

    async def get_zone_incidents(self, zone_name: str, limit: int = 20):
        cursor = (
            incidents_collection.find({"jurisdiction": zone_name, "exclusion_reason": None})
            .sort("published_date", -1)
            .limit(limit)
        )
        incidents = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            incidents.append(doc)
        return incidents

    async def refresh(self):
        geojson_service.reload()
        zones = await self.get_all_zones()
        return {"success": True, "zones": len(zones), "updated_at": datetime.utcnow().isoformat()}

    async def rebuild(self):
        geojson_service.clear()
        return await self.refresh()

    async def heatmap(self):
        zones = await self.get_all_zones()
        return [
            {"lat": z["latitude"], "lng": z["longitude"], "weight": z["crime_score"]["raw_weighted_score"], "name": z["name"]}
            for z in zones
        ]


zone_service = ZoneService()