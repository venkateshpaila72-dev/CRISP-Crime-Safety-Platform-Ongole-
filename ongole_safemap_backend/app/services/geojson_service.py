import json
import os
from pathlib import Path
from typing import Dict, List, Optional

from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(exist_ok=True)

GEOJSON_FILE = DATA_DIR / "ongole.geojson"


class GeoJSONService:

    def __init__(self):

        self.geojson = None

        self.features = []

        self.feature_index = {}

        self.load()

    # ----------------------------------------------------
    # LOAD
    # ----------------------------------------------------

    def load(self):

        if not GEOJSON_FILE.exists():

            self.geojson = {
                "type": "FeatureCollection",
                "features": []
            }

            self.features = []

            self.feature_index = {}

            return

        with open(GEOJSON_FILE, "r", encoding="utf8") as f:

            self.geojson = json.load(f)

        self.features = self.geojson.get("features", [])

        self.build_index()

    # ----------------------------------------------------
    # SAVE
    # ----------------------------------------------------

    def save(self):

        self.geojson["features"] = self.features

        with open(
            GEOJSON_FILE,
            "w",
            encoding="utf8"
        ) as f:

            json.dump(
                self.geojson,
                f,
                indent=2
            )

    # ----------------------------------------------------
    # INDEX
    # ----------------------------------------------------

    def build_index(self):

        self.feature_index = {}

        for feature in self.features:

            props = feature.get("properties", {})

            name = props.get("name")

            if not name:
                continue

            self.feature_index[
                name.lower()
            ] = feature

    # ----------------------------------------------------
    # GETTERS
    # ----------------------------------------------------

    def get_all(self):

        return self.features

    def count(self):

        return len(self.features)

    def exists(self, locality: str):

        return locality.lower() in self.feature_index

    def get(self, locality: str):

        return self.feature_index.get(
            locality.lower()
        )

    # ----------------------------------------------------
    # SEARCH
    # ----------------------------------------------------

    def search(self, text: str):

        text = text.lower()

        result = []

        for feature in self.features:

            name = feature["properties"]["name"]

            if text in name.lower():

                result.append(feature)

        return result

    # ----------------------------------------------------
    # GEOMETRY
    # ----------------------------------------------------

    def geometry(self, locality: str):

        feature = self.get(locality)

        if feature is None:

            return None

        return shape(
            feature["geometry"]
        )

    def centroid(self, locality: str):

        geom = self.geometry(locality)

        if geom is None:

            return None

        c = geom.centroid

        return {
            "lat": c.y,
            "lng": c.x
        }

    def contains(self, locality, lat, lng):

        geom = self.geometry(locality)

        if geom is None:

            return False

        point = Point(lng, lat)

        return geom.contains(point)

    def locality_from_point(
        self,
        lat,
        lng
    ):

        point = Point(lng, lat)

        for feature in self.features:

            geom = shape(
                feature["geometry"]
            )

            if geom.contains(point):

                return feature

        return None
    # ----------------------------------------------------
    # CREATE FEATURE
    # ----------------------------------------------------

    def create_feature(
        self,
        locality: str,
        latitude: float,
        longitude: float,
        geometry: dict,
    ):

        if self.exists(locality):
            return self.get(locality)

        feature = {
            "type": "Feature",
            "properties": {
                "id": locality.lower().replace(" ", "_"),
                "name": locality,
                "crime_score": 0,
                "incident_count": 0,
                "risk": "SAFE",
                "last_updated": None,
            },
            "geometry": geometry,
        }

        self.features.append(feature)

        self.feature_index[locality.lower()] = feature

        return feature

    # ----------------------------------------------------
    # UPDATE STATS
    # ----------------------------------------------------

    def update_statistics(
        self,
        locality: str,
        crime_score: int,
        incident_count: int,
        risk: str,
        last_updated,
    ):

        feature = self.get(locality)

        if feature is None:
            return False

        props = feature["properties"]

        props["crime_score"] = crime_score
        props["incident_count"] = incident_count
        props["risk"] = risk

        if last_updated is not None:
            try:
                props["last_updated"] = last_updated.isoformat()
            except Exception:
                props["last_updated"] = str(last_updated)

        return True

    # ----------------------------------------------------
    # DELETE
    # ----------------------------------------------------

    def remove(self, locality: str):

        feature = self.get(locality)

        if feature is None:
            return False

        self.features.remove(feature)

        self.feature_index.pop(locality.lower(), None)

        return True

    # ----------------------------------------------------
    # BOUNDS
    # ----------------------------------------------------

    def bounds(self):

        if not self.features:
            return None

        geometries = [
            shape(feature["geometry"])
            for feature in self.features
        ]

        merged = unary_union(geometries)

        minx, miny, maxx, maxy = merged.bounds

        return {
            "south": miny,
            "west": minx,
            "north": maxy,
            "east": maxx,
        }

    # ----------------------------------------------------
    # EXPORT
    # ----------------------------------------------------

    def export(self):

        return {
            "type": "FeatureCollection",
            "features": self.features,
        }

    # ----------------------------------------------------
    # RELOAD
    # ----------------------------------------------------

    def reload(self):

        self.load()

    # ----------------------------------------------------
    # CLEAR
    # ----------------------------------------------------

    def clear(self):

        self.features = []

        self.feature_index = {}

        self.geojson = {
            "type": "FeatureCollection",
            "features": [],
        }

        self.save()
    # ----------------------------------------------------
    # AUTO CREATE POLYGON
    # ----------------------------------------------------

    def create_polygon_from_point(
        self,
        locality: str,
        latitude: float,
        longitude: float,
        radius: float = 0.003,
    ):

        point = Point(longitude, latitude)

        polygon = point.buffer(
            radius,
            resolution=24
        )

        feature = self.create_feature(
            locality=locality,
            latitude=latitude,
            longitude=longitude,
            geometry=mapping(polygon),
        )

        return feature

    # ----------------------------------------------------
    # UPSERT LOCALITY
    # ----------------------------------------------------

    def upsert_locality(
        self,
        locality: str,
        latitude: float,
        longitude: float,
    ):

        feature = self.get(locality)

        if feature is None:

            feature = self.create_polygon_from_point(
                locality,
                latitude,
                longitude,
            )

        return feature

    # ----------------------------------------------------
    # UPDATE FROM INCIDENT
    # ----------------------------------------------------

    def update_from_incident(
        self,
        locality: str,
        latitude: float,
        longitude: float,
        crime_score: int,
        incident_count: int,
        risk: str,
        last_updated,
    ):

        feature = self.upsert_locality(
            locality,
            latitude,
            longitude,
        )

        self.update_statistics(
            locality=locality,
            crime_score=crime_score,
            incident_count=incident_count,
            risk=risk,
            last_updated=last_updated,
        )

        self.save()

        return feature

    # ----------------------------------------------------
    # BULK UPDATE
    # ----------------------------------------------------

    def bulk_update(
        self,
        zones: List[Dict],
    ):

        for zone in zones:

            self.upsert_locality(
                locality=zone["name"],
                latitude=zone["latitude"],
                longitude=zone["longitude"],
            )

            self.update_statistics(
                locality=zone["name"],
                crime_score=zone["crime_score"],
                incident_count=zone["incident_count"],
                risk=zone["risk"],
                last_updated=zone["last_updated"],
            )

        self.save()

    # ----------------------------------------------------
    # AS LEAFLET
    # ----------------------------------------------------

    def leaflet(self):

        return {
            "type": "FeatureCollection",
            "features": self.features,
        }


geojson_service = GeoJSONService()