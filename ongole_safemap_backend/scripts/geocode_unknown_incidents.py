"""
One-time backlog fix: attempts to resolve a real locality for every
existing incident that has no jurisdiction match, using the same
candidate-extraction + Nominatim geocoding fallback the live scraper now
uses going forward. No re-scraping — works entirely from title+description
already stored in MongoDB.

Runs slowly and deliberately (Nominatim's free tier allows ~1 request/
second) — expect roughly 1-2 seconds per unresolved incident.

Run from the project root:
    python -m scripts.geocode_unknown_incidents
"""

import asyncio

from app.database import incidents_collection
from app.scraper.extraction import resolve_jurisdiction_with_geocoding


async def run():
    query = {"jurisdiction": None, "exclusion_reason": None}
    targets = await incidents_collection.find(query).to_list(length=None)
    print(f"Found {len(targets)} incidents with no jurisdiction match — attempting to resolve...\n")

    resolved_count = 0
    still_unknown = 0

    for i, doc in enumerate(targets):
        raw_text = f"{doc.get('title', '')} {doc.get('description', '')}"
        resolved = await asyncio.to_thread(resolve_jurisdiction_with_geocoding, raw_text)

        if resolved:
            await incidents_collection.update_one(
                {"_id": doc["_id"]}, {"$set": {"jurisdiction": resolved}}
            )
            resolved_count += 1
            print(f"  [{i+1}/{len(targets)}] '{doc.get('title', '')[:60]}' -> {resolved}")
        else:
            still_unknown += 1

        if (i + 1) % 20 == 0:
            print(f"  ...progress: {i+1}/{len(targets)}")

    print(f"\nDone. Resolved: {resolved_count}, still unresolvable: {still_unknown}")
    print("Zone stats will reflect this automatically on the next /zones request.")


if __name__ == "__main__":
    asyncio.run(run())