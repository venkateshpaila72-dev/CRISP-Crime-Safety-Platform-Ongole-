"""
Free geocoding via OpenStreetMap Nominatim, biased to the Ongole/Prakasam
area. Results are cached to disk so a given locality name is only ever
looked up once — both to respect Nominatim's usage policy (max 1 request/
second, no bulk abuse) and so repeated scraper runs don't re-fetch the
same names.

If a name can't be resolved, it's cached as a miss too (so we don't
retry a name that's genuinely unresolvable on every single run).
"""

import json
import time
from pathlib import Path

import requests

BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_FILE = BASE_DIR / "data" / "geocode_cache.json"

HEADERS = {
    "User-Agent": "OngoleSafeMap/1.0 (student hackathon project; contact: n/a)"
}

MIN_REQUEST_INTERVAL = 1.1  # Nominatim policy: max 1 request/second

ONGOLE_BOUNDS = {
    "min_lat": 15.40, "max_lat": 15.60,
    "min_lon": 79.95, "max_lon": 80.15,
}


class GeocodingService:
    def __init__(self):
        self._cache: dict[str, dict | None] = {}
        self._last_request_time = 0.0
        self._load_cache()

    def _load_cache(self):
        if CACHE_FILE.exists():
            with open(CACHE_FILE, "r", encoding="utf8") as f:
                self._cache = json.load(f)
        else:
            self._cache = {}

    def _save_cache(self):
        CACHE_FILE.parent.mkdir(exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf8") as f:
            json.dump(self._cache, f, indent=2)

    def get_cached(self, name: str) -> dict | None:
        """Non-network lookup — used by zone_service to resolve coordinates
        for already-geocoded localities without hitting the network."""
        return self._cache.get(name.lower())

    def geocode(self, name: str) -> dict | None:
        """Geocode a locality name, biased to the Ongole area. Returns
        {'latitude': ..., 'longitude': ...} or None if unresolvable.
        Cached — a given name only ever triggers one real network call."""
        key = name.lower()
        if key in self._cache:
            return self._cache[key]

        elapsed = time.time() - self._last_request_time
        if elapsed < MIN_REQUEST_INTERVAL:
            time.sleep(MIN_REQUEST_INTERVAL - elapsed)

        try:
            resp = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": f"{name}, Ongole, Prakasam, Andhra Pradesh, India",
                    "format": "json",
                    "limit": 1,
                },
                headers=HEADERS,
                timeout=10,
            )
            self._last_request_time = time.time()
            resp.raise_for_status()
            results = resp.json()

            if not results:
                self._cache[key] = None
                self._save_cache()
                return None

            lat = float(results[0]["lat"])
            lon = float(results[0]["lon"])

            if not (ONGOLE_BOUNDS["min_lat"] <= lat <= ONGOLE_BOUNDS["max_lat"]
                    and ONGOLE_BOUNDS["min_lon"] <= lon <= ONGOLE_BOUNDS["max_lon"]):
                self._cache[key] = None
                self._save_cache()
                return None

            coords = {"latitude": lat, "longitude": lon}
            self._cache[key] = coords
            self._save_cache()
            return coords

        except Exception:
            return None


geocoding_service = GeocodingService()