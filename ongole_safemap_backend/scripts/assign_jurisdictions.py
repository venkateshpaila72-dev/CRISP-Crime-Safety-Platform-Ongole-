"""
Reprocesses every incident in the database and assigns the best possible
jurisdiction, using this priority order:

1. Specific locality (LOCALITY_KEYWORDS) — most precise
2. Broad police jurisdiction (ONGOLE_ZONE_KEYWORDS) — "one town"/"two town"/"taluka"
3. Citywide bucket — the incident IS genuinely about Ongole (is_ongole_related=True,
   not excluded) but names no specific place. This is an honest, real category,
   not a failure state — most local news genuinely doesn't specify a locality.
4. Left as null — only for incidents that aren't actually about Ongole at all
   (e.g. Markapuram, Chennai, other districts) or are excluded as noise.

Seed data (source="seed") is skipped entirely — it's synthetic and was already
correctly zone-tagged at creation time; re-matching short synthetic titles
against real-world keywords only destroys that correct assignment.

Run from the project root:
    python -m scripts.assign_jurisdictions
"""

import asyncio

from app.database import incidents_collection
from app.scraper.keywords_config import LOCALITY_KEYWORDS, ONGOLE_ZONE_KEYWORDS

CITYWIDE_BUCKET = "Ongole (Citywide / Unspecified)"


def match_jurisdiction_thorough(text: str, is_ongole_related: bool, is_excluded: bool) -> str | None:
    text_lower = text.lower()

    for locality, keywords in LOCALITY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return locality

    for zone, keywords in ONGOLE_ZONE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return zone

    if is_ongole_related and not is_excluded:
        return CITYWIDE_BUCKET

    return None


async def assign_jurisdictions():
    total = 0
    skipped_seed = 0
    assigned_specific = 0
    assigned_zone = 0
    assigned_citywide = 0
    left_null = 0
    unchanged = 0

    cursor = incidents_collection.find({})
    async for doc in cursor:
        total += 1

        if doc.get("source") == "seed":
            skipped_seed += 1
            continue

        title = doc.get("title", "")
        description = doc.get("description", "")
        raw_text = f"{title} {description}"

        is_ongole_related = bool(doc.get("is_ongole_related"))
        is_excluded = doc.get("exclusion_reason") is not None

        new_jurisdiction = match_jurisdiction_thorough(raw_text, is_ongole_related, is_excluded)
        old_jurisdiction = doc.get("jurisdiction")

        if new_jurisdiction == old_jurisdiction:
            unchanged += 1
            continue

        await incidents_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"jurisdiction": new_jurisdiction}},
        )

        if new_jurisdiction is None:
            left_null += 1
        elif new_jurisdiction == CITYWIDE_BUCKET:
            assigned_citywide += 1
        elif new_jurisdiction in ONGOLE_ZONE_KEYWORDS:
            assigned_zone += 1
        else:
            assigned_specific += 1

    print(f"Total incidents scanned:        {total}")
    print(f"Skipped (seed data, untouched): {skipped_seed}")
    print(f"Unchanged (already correct):    {unchanged}")
    print(f"Assigned to specific locality:  {assigned_specific}")
    print(f"Assigned to police zone:        {assigned_zone}")
    print(f"Assigned to citywide bucket:    {assigned_citywide}")
    print(f"Left unassigned (not Ongole / excluded): {left_null}")
    print("\nDone. Zone stats will reflect this automatically on the next /zones request.")


if __name__ == "__main__":
    asyncio.run(assign_jurisdictions())