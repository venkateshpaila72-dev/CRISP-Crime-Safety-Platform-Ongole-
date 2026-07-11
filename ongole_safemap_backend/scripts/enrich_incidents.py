import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))



import asyncio
import json
import re
from collections import Counter
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.utils.recompute_zones import recompute_all_zones

client = AsyncIOMotorClient(settings.mongodb_uri)

db = client[settings.mongodb_db_name]

incidents_collection = db["incidents"]

LOCATION_FILE = (
    Path(__file__).resolve().parent.parent
    / "app"
    / "data"
    / "ongole_locations.json"
)

with open(LOCATION_FILE, "r", encoding="utf-8") as f:

    LOCATIONS = json.load(f)


def normalize(text):

    if not text:
        return ""

    text = text.lower()

    text = re.sub(r"[^a-z0-9 ]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


LOCATION_LOOKUP = []

for location in LOCATIONS:

    aliases = location.get("aliases", [])

    aliases.sort(key=len, reverse=True)

    LOCATION_LOOKUP.append(

        {

            "name": location["name"],

            "latitude": location["latitude"],

            "longitude": location["longitude"],

            "aliases": aliases,

        }

    )


CRIME_KEYWORDS = {

    "Murder": [
        "murder",
        "killed",
        "shot dead",
        "homicide",
        "stabbed",
    ],

    "Robbery": [
        "robbery",
        "loot",
        "looted",
        "robbed",
    ],

    "Theft": [
        "theft",
        "stolen",
        "steal",
        "burglary",
    ],

    "Chain Snatching": [
        "chain",
        "snatching",
    ],

    "Vehicle Theft": [
        "bike",
        "car",
        "vehicle",
        "motorcycle",
    ],

    "Assault": [
        "attack",
        "attacked",
        "assault",
        "beaten",
    ],

    "Harassment": [
        "harassment",
        "eve teasing",
        "stalking",
    ],

}
SEVERITY_KEYWORDS = {

    "Critical": [
        "murder",
        "shot dead",
        "rape",
        "kidnap",
        "homicide",
    ],

    "High": [
        "robbery",
        "loot",
        "chain snatching",
        "gang",
    ],

    "Medium": [
        "assault",
        "burglary",
        "theft",
        "cyber",
    ],

    "Low": [
        "harassment",
        "complaint",
        "missing",
    ],

}


TIME_KEYWORDS = {

    "Morning": [
        "morning",
        "6 am",
        "7 am",
        "8 am",
        "9 am",
        "10 am",
    ],

    "Afternoon": [
        "afternoon",
        "12 pm",
        "1 pm",
        "2 pm",
        "3 pm",
        "4 pm",
    ],

    "Evening": [
        "evening",
        "5 pm",
        "6 pm",
        "7 pm",
    ],

    "Night": [
        "night",
        "late night",
        "midnight",
        "8 pm",
        "9 pm",
        "10 pm",
        "11 pm",
        "12 am",
        "1 am",
        "2 am",
        "3 am",
        "4 am",
        "5 am",
    ],

}


def detect_location(text):

    text = normalize(text)

    for location in LOCATION_LOOKUP:

        for alias in location["aliases"]:

            if alias.lower() in text:

                return location

    return None


def detect_category(text):

    text = normalize(text)

    for category, keywords in CRIME_KEYWORDS.items():

        for keyword in keywords:

            if keyword in text:

                return category

    return "Other"


def detect_severity(text):

    text = normalize(text)

    for severity, keywords in SEVERITY_KEYWORDS.items():

        for keyword in keywords:

            if keyword in text:

                return severity

    return "Low"


def detect_time(text):

    text = normalize(text)

    for tod, keywords in TIME_KEYWORDS.items():

        for keyword in keywords:

            if keyword in text:

                return tod

    return "Unknown"


async def enrich_document(document):

    title = document.get("title", "")

    description = document.get("description", "")

    source = document.get("source_url", "")

    text = f"{title} {description} {source}"

    updates = {}

    location = detect_location(text)

    if location:

        if not document.get("jurisdiction"):

            updates["jurisdiction"] = location["name"]

        if not document.get("latitude"):

            updates["latitude"] = location["latitude"]

        if not document.get("longitude"):

            updates["longitude"] = location["longitude"]

    if not document.get("crime_category"):

        updates["crime_category"] = detect_category(text)

    if not document.get("severity"):

        updates["severity"] = detect_severity(text)

    if not document.get("time_of_day"):

        updates["time_of_day"] = detect_time(text)

    return updates
async def main():

    print("=" * 60)
    print("ONGOLE INCIDENT ENRICHMENT")
    print("=" * 60)

    total = 0
    updated = 0
    skipped = 0

    locality_counter = Counter()
    category_counter = Counter()

    cursor = incidents_collection.find({})

    async for incident in cursor:

        total += 1

        updates = await enrich_document(incident)

        if not updates:

            skipped += 1
            continue

        await incidents_collection.update_one(
            {
                "_id": incident["_id"]
            },
            {
                "$set": updates
            }
        )

        updated += 1

        if "jurisdiction" in updates:
            locality_counter[updates["jurisdiction"]] += 1

        if "crime_category" in updates:
            category_counter[updates["crime_category"]] += 1

    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)

    print(f"Total Incidents : {total}")
    print(f"Updated         : {updated}")
    print(f"Skipped         : {skipped}")

    print()
    print("=" * 60)
    print("TOP DETECTED LOCALITIES")
    print("=" * 60)

    for locality, count in locality_counter.most_common(30):

        print(f"{locality:<35}{count}")

    print()
    print("=" * 60)
    print("TOP CRIME CATEGORIES")
    print("=" * 60)

    for category, count in category_counter.most_common():

        print(f"{category:<25}{count}")

    print()
    print("Recomputing Zones...")

    result = await recompute_all_zones()

    print(result)

    client.close()

    print()
    print("Done ✔")


if __name__ == "__main__":

    asyncio.run(main())