"""
generate_ongole_geojson.py

Usage:
    python generate_ongole_geojson.py

Requirements:
    pip install requests shapely

Output:
    app/data/ongole.geojson
"""

import json
import os
import time
import requests
from shapely.geometry import Point, mapping

OUTPUT = "app/data/ongole.geojson"

NOMINATIM = "https://nominatim.openstreetmap.org/search"

HEADERS = {
    "User-Agent": "OngoleSafeMap/1.0"
}

LOCALITIES = [
    "One Town, Ongole",
    "Two Town, Ongole",
    "Lawyer Pet, Ongole",
    "Lawyerpet, Ongole",
    "Gaddalagunta, Ongole",
    "Kammapalem, Ongole",
    "East Kammapalem, Ongole",
    "Pernamitta, Ongole",
    "Mangamuru, Ongole",
    "Housing Board Colony, Ongole",
    "Ramnagar, Ongole",
    "Railway Colony, Ongole",
    "Bhagya Nagar, Ongole",
    "Gopal Nagar, Ongole",
    "Devuni Cheruvu, Ongole",
    "Pokala Colony, Ongole",
    "Brundavan Nagar, Ongole",
    "Nehru Nagar, Ongole",
    "Bharath Nagar, Ongole",
    "Kurnool Road, Ongole",
    "Kothapatnam Road, Ongole",
    "Railpeta, Ongole",
    "Islampet, Ongole",
    "Mamidipalem, Ongole",
    "Throvagunta, Ongole",
    "Mukthinuthalapadu, Ongole",
    "Gudimellapadu, Ongole",
    "Koppolu, Ongole",
    "Manduvavaripalem, Ongole",
    "Cheruvukommupalem, Ongole",
    "Vantavari Colony, Ongole",
    "NTR Colony, Ongole",
    "Indiramma Colony, Ongole",
    "Santhapeta, Ongole",
    "Balaji Nagar, Ongole",
    "Sai Nagar, Ongole",
    "Ashok Nagar, Ongole",
    "Sujatha Nagar, Ongole",
    "RTC Colony, Ongole",
    "Addanki Bus Stand, Ongole",
    "Collector Office Area, Ongole",
    "District Court Area, Ongole",
    "Government Hospital Area, Ongole",
    "Ayyappa Swamy Temple Area, Ongole",
    "Mini Bypass, Ongole",
    "Old Bus Stand, Ongole",
    "New Bus Stand, Ongole",
    "Court Centre, Ongole",
    "Anjaiah Road, Ongole",
    "Trunk Road, Ongole",
]


def geocode(place):
    params = {
        "q": place,
        "format": "jsonv2",
        "limit": 1
    }

    r = requests.get(
        NOMINATIM,
        params=params,
        headers=HEADERS,
        timeout=30,
    )

    if r.status_code != 200:
        return None

    data = r.json()

    if not data:
        return None

    return (
        float(data[0]["lat"]),
        float(data[0]["lon"])
    )


def make_polygon(lat, lon):
    point = Point(lon, lat)

    polygon = point.buffer(
        0.003,
        resolution=24
    )

    return mapping(polygon)


def slug(text):
    return (
        text.lower()
        .replace(",", "")
        .replace(".", "")
        .replace(" ", "_")
    )


features = []

seen = set()

for locality in LOCALITIES:

    print("Searching:", locality)

    location = geocode(locality)

    if location is None:
        print("Not found")
        continue

    lat, lon = location

    key = slug(locality)

    if key in seen:
        continue

    seen.add(key)

    feature = {
        "type": "Feature",
        "properties": {
            "id": key,
            "name": locality.replace(", Ongole", ""),
            "crime_score": 0,
            "incident_count": 0,
            "risk": "SAFE",
            "last_updated": None
        },
        "geometry": make_polygon(lat, lon)
    }

    features.append(feature)

    print("Added")

    time.sleep(1)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

os.makedirs(
    os.path.dirname(OUTPUT),
    exist_ok=True
)

with open(
    OUTPUT,
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        geojson,
        f,
        indent=2
    )

print()
print("===============================")
print("Generated", len(features), "localities")
print("Saved to", OUTPUT)
print("===============================")