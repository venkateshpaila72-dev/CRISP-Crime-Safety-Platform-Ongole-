"""
Diagnostic script — dumps every document in incidents_collection to a JSON
file for manual inspection, and prints summary breakdowns so you can quickly
see where data is missing (unresolved jurisdiction, missing category, etc.)
without having to scroll through MongoDB Atlas by hand.

Run from the project root:
    python -m scripts.inspect_incidents
"""

import asyncio
import json
from collections import Counter
from pathlib import Path

from app.database import incidents_collection

OUTPUT_FILE = Path(__file__).resolve().parent.parent / "incidents_dump.json"


def _json_safe(doc: dict) -> dict:
    """Convert ObjectId / datetime fields to strings so json.dump doesn't choke."""
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out[k] = str(v)
        elif hasattr(v, "isoformat"):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


async def inspect():
    docs = await incidents_collection.find({}).to_list(length=None)
    total = len(docs)
    print(f"Total documents in incidents_collection: {total}\n")

    if total == 0:
        print("Collection is empty — nothing to inspect. Have you run the scraper/backfill yet?")
        return

    # --- Exclusion breakdown ---
    excluded = [d for d in docs if d.get("exclusion_reason")]
    usable = [d for d in docs if not d.get("exclusion_reason")]
    print(f"Excluded (noise, filtered out): {len(excluded)}")
    print(f"Usable (real incidents):        {len(usable)}\n")

    if excluded:
        print("Exclusion reason breakdown:")
        for reason, count in Counter(d["exclusion_reason"] for d in excluded).most_common():
            print(f"  {reason}: {count}")
        print()

    # --- Jurisdiction / location resolution ---
    resolved = [d for d in usable if d.get("jurisdiction")]
    unresolved = [d for d in usable if not d.get("jurisdiction")]
    print(f"Usable incidents WITH a resolved jurisdiction:    {len(resolved)}")
    print(f"Usable incidents WITHOUT a resolved jurisdiction: {len(unresolved)}  <- these show as 'Unknown', filtered off the map\n")

    if resolved:
        print("Jurisdiction breakdown (resolved only):")
        for jurisdiction, count in Counter(d["jurisdiction"] for d in resolved).most_common():
            print(f"  {jurisdiction}: {count}")
        print()

    # --- Category breakdown ---
    with_category = [d for d in usable if d.get("crime_category")]
    print(f"Usable incidents WITH a crime_category: {len(with_category)}")
    print(f"Usable incidents WITHOUT a category:    {len(usable) - len(with_category)}\n")
    if with_category:
        print("Category breakdown:")
        for cat, count in Counter(d["crime_category"] for d in with_category).most_common():
            print(f"  {cat}: {count}")
        print()

    # --- Severity breakdown ---
    print("Severity breakdown (usable incidents):")
    for sev, count in Counter(d.get("severity") or "None" for d in usable).most_common():
        print(f"  {sev}: {count}")
    print()

    # --- Source breakdown (seed / scraper / backfill) ---
    print("Source breakdown (all documents):")
    for src, count in Counter(d.get("source") or "None" for d in docs).most_common():
        print(f"  {src}: {count}")
    print()

    # --- Image coverage ---
    with_image = [d for d in usable if d.get("image_url")]
    print(f"Usable incidents WITH an image_url: {len(with_image)}")
    print(f"Usable incidents WITHOUT an image:   {len(usable) - len(with_image)}\n")

    # --- Sample of unresolved incidents, so you can eyeball WHY they failed ---
    if unresolved:
        print("Sample of unresolved (no-jurisdiction) titles, to spot-check manually:")
        for d in unresolved[:15]:
            print(f"  - {d.get('title', '(no title)')}")
        print()

    # --- Write full dump to disk ---
    with open(OUTPUT_FILE, "w", encoding="utf8") as f:
        json.dump([_json_safe(d) for d in docs], f, indent=2, ensure_ascii=False)

    print(f"Full data dumped to: {OUTPUT_FILE}")
    print("Open that file to inspect every field on every document directly.")


if __name__ == "__main__":
    asyncio.run(inspect())