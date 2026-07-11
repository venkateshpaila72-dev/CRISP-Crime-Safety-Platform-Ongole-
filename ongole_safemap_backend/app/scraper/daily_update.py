"""
Daily incremental scraper. Fetches recent Ongole-related crime news via RSS,
fetches each article's full page to extract an image, runs extraction +
exclusion filtering, and writes new incidents to MongoDB.
Designed to be run standalone (python -m app.scraper.daily_update) or via
the GitHub Actions cron job — this is the script that keeps "today/yesterday"
incidents flowing in, images included, on every scheduled run.
"""

import asyncio
from datetime import datetime, timezone
from app.utils.recompute_zones import recompute_all_zones
import feedparser
import requests
from app.websocket.websocket_manager import manager
from app.database import incidents_collection
from app.scraper.extraction import extract_incident, resolve_jurisdiction_with_geocoding
from app.scraper.image_extraction import extract_image_url

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}

RSS_FEEDS = [
    {"url": "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss", "source_name": "The Hindu"},
    {"url": "https://www.newindianexpress.com/states/andhra-pradesh/rssfeed/?id=170&getXmlFeed=true", "source_name": "The New Indian Express"},
]


def fetch_image_for_url(link: str) -> str | None:
    """Best-effort fetch of the article page just to pull its preview image.
    Failures here never break incident insertion — image is optional."""
    try:
        resp = requests.get(link, headers=HEADERS, timeout=8)
        resp.raise_for_status()
        return extract_image_url(resp.text, resp.url)
    except Exception:
        return None


async def fetch_and_process_feed(feed_config: dict) -> dict:
    stats = {"fetched": 0, "inserted": 0, "excluded": 0, "duplicates": 0, "errors": []}

    try:
        parsed = feedparser.parse(feed_config["url"])
    except Exception as e:
        stats["errors"].append(f"Failed to fetch {feed_config['url']}: {e}")
        return stats

    for entry in parsed.entries:
        title = entry.get("title", "")
        summary = entry.get("summary", "")
        link = entry.get("link", "")
        raw_text = f"{title} {summary}"

        if "ongole" not in raw_text.lower() and "prakasam" not in raw_text.lower():
            continue

        stats["fetched"] += 1

        existing = await incidents_collection.find_one({"source_url": link})
        if existing:
            stats["duplicates"] += 1
            continue

        extracted = extract_incident(raw_text, title)

        # Static gazetteer missed it — try the geocoding fallback before
        # giving up and leaving this incident unpinned on the map.
        if extracted["jurisdiction"] is None and not extracted["exclusion_reason"]:
            resolved = await asyncio.to_thread(resolve_jurisdiction_with_geocoding, raw_text)
            if resolved:
                extracted["jurisdiction"] = resolved

        published_date = None
        if entry.get("published_parsed"):
            published_date = datetime(*entry["published_parsed"][:6], tzinfo=timezone.utc)

        # Only fetch the full page (for an image) if this incident is actually
        # going to be shown publicly — skip fetching for excluded articles
        # (accidents, admin news, etc.) to save time/requests.
        image_url = None
        if not extracted["exclusion_reason"]:
            image_url = await asyncio.to_thread(fetch_image_for_url, link)

        doc = {
            **extracted,
            "published_date": published_date,
            "source_name": feed_config["source_name"],
            "source_url": link,
            "image_url": image_url,
            "source": "scraper",
        }

        await incidents_collection.insert_one(doc)

        await manager.broadcast({
            "type": "incident_added",
            "zone": extracted.get("jurisdiction"),
        })

        await manager.broadcast({
            "type": "refresh_map",
        })

        if extracted["exclusion_reason"]:
            stats["excluded"] += 1
        else:
            stats["inserted"] += 1

    return stats


async def run_scraper() -> dict:
    combined = {
        "status": "completed",
        "articles_found": 0,
        "incidents_added": 0,
        "errors": [],
    }

    for feed_config in RSS_FEEDS:
        stats = await fetch_and_process_feed(feed_config)
        combined["articles_found"] += stats["fetched"]
        combined["incidents_added"] += stats["inserted"]
        combined["errors"].extend(stats["errors"])

    if combined["errors"]:
        combined["status"] = "completed_with_errors"

    # Recompute zone scores after new incidents are inserted
    zone_result = await recompute_all_zones()

    combined["zones_updated"] = zone_result

    await manager.broadcast({
        "type": "zone_updated",
    })

    await manager.broadcast({
        "type": "heatmap_updated",
    })

    return combined


if __name__ == "__main__":
    result = asyncio.run(run_scraper())
    print(result)