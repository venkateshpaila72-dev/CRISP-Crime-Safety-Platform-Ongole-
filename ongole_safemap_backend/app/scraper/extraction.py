"""
Rule-based extraction logic. Same approach validated in the Colab notebook,
now writing directly to MongoDB instead of a CSV.
"""

import re

from app.scraper.keywords_config import (
    CRIME_KEYWORDS_MAP, SEVERITY_KEYWORDS, TIME_OF_DAY_KEYWORDS,
    ACCIDENT_EXCLUSION_KEYWORDS, LEGAL_PROCEEDING_KEYWORDS,
    ADMINISTRATIVE_KEYWORDS, OTHER_PRAKASAM_LOCATIONS,
    ONGOLE_ZONE_KEYWORDS, LOCALITY_KEYWORDS,
)
from app.services.geocoding_service import geocoding_service


def should_exclude(text: str) -> tuple[bool, str | None]:
    text_lower = text.lower()

    if any(kw in text_lower for kw in ACCIDENT_EXCLUSION_KEYWORDS):
        return True, "accident, not a crime"

    if any(kw in text_lower for kw in ADMINISTRATIVE_KEYWORDS):
        return True, "administrative/policy news, not a specific incident"

    if any(kw in text_lower for kw in LEGAL_PROCEEDING_KEYWORDS):
        return True, "court/sentencing coverage of an older case"

    for loc in OTHER_PRAKASAM_LOCATIONS:
        loc_pos = text_lower.find(loc)
        ongole_pos = text_lower.find("ongole")
        if loc_pos != -1 and (ongole_pos == -1 or loc_pos < ongole_pos):
            return True, f"incident location appears to be {loc}, not Ongole town"

    return False, None


def is_crime_related(text: str) -> bool:
    text_lower = text.lower()
    return any(
        kw in text_lower
        for keywords in CRIME_KEYWORDS_MAP.values()
        for kw in keywords
    )


def is_ongole_related(text: str) -> bool:
    return "ongole" in text.lower()


def match_category(text: str) -> str:
    """
    Returns the best-matching crime category, or "Other" if the text is
    confirmed crime-related (by is_crime_related) but doesn't match any
    specific category keyword. Never returns None — a None category on a
    confirmed-crime incident is a data gap, not a meaningful "no category"
    state, and silently propagates into crime_score.py's Counter as a
    None key if left unhandled.
    """
    text_lower = text.lower()
    for category, keywords in CRIME_KEYWORDS_MAP.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return "Other"


def match_severity(text: str) -> str:
    """
    Returns the best-matching severity, defaulting to "Medium" rather than
    None when no severity keyword matches — same reasoning as match_category.
    """
    text_lower = text.lower()
    for level in ("High", "Medium", "Low"):
        if any(kw in text_lower for kw in SEVERITY_KEYWORDS[level]):
            return level
    return "Medium"


def match_time_of_day(text: str) -> str:
    text_lower = text.lower()
    for period, keywords in TIME_OF_DAY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return period
    return "Unknown"


def match_jurisdiction(text: str) -> str | None:
    text_lower = text.lower()

    # Check specific localities first — more precise than the broad
    # police-jurisdiction labels
    for locality, keywords in LOCALITY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return locality

    # Fall back to the broad official jurisdiction if no specific
    # locality was mentioned
    for zone, keywords in ONGOLE_ZONE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return zone

    return None  # citywide / unmatched — resolved by zone_service.py's
                 # group_by_locality(), which buckets this into the
                 # "Ongole (Citywide / Unspecified)" zone rather than
                 # dropping it silently.


# --- Geocoding fallback, used when match_jurisdiction() above returns None ---

# Common phrasing patterns Indian local news uses to name a specific place.
# Ordered roughly most-specific-first. Each captures a Title Case phrase of
# 1-3 words immediately following the trigger word.
_LOCALITY_PATTERNS = [
    re.compile(r'\bunder ([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,2}) police station\b'),
    re.compile(r'\bin ([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,2}) village\b'),
    re.compile(r'\bat ([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,2})\b'),
    re.compile(r'\bnear ([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,2})\b'),
    re.compile(r'\bin ([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,2}) area\b'),
]

# Words that are technically Title Case matches but are never real localities
# — skip these so we don't waste a geocoding request on them.
_LOCALITY_STOPWORDS = {
    "ongole", "prakasam", "andhra pradesh", "andhra", "india",
    "the hindu", "deccan chronicle", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday", "sunday",
}


def _candidate_localities(text: str) -> list[str]:
    """Pulls plausible place-name candidates out of raw article text, in
    the order the patterns above are checked. Deduplicated, stopwords
    removed — does not verify these are real places, that's geocoding's job."""
    candidates: list[str] = []
    for pattern in _LOCALITY_PATTERNS:
        for match in pattern.finditer(text):
            name = match.group(1).strip()
            if name.lower() in _LOCALITY_STOPWORDS:
                continue
            if name not in candidates:
                candidates.append(name)
    return candidates


def resolve_jurisdiction_with_geocoding(raw_text: str) -> str | None:
    """
    Fallback for incidents the static LOCALITY_KEYWORDS/ONGOLE_ZONE_KEYWORDS
    gazetteer didn't match. Pulls candidate place names out of the article
    text using common Indian-news phrasing ("at X", "in X village", "under
    X police station", "near X"), then asks geocoding_service to resolve
    each one via Nominatim, biased to the Ongole/Prakasam area.

    Returns the FIRST candidate that geocodes to a real point inside
    geocoding_service's ONGOLE_BOUNDS, so it can be used directly as the
    incident's jurisdiction string — geocoding_service caches the resolved
    coordinate under this same name, so zone_service.py's build_zone() can
    look it up later (via geocoding_service.get_cached()) without a second
    network call.

    Returns None if no candidate resolves — the common case, since most
    articles don't name anything specific enough to geocode within Ongole.
    This makes a real (rate-limited, cached) network call per NEW candidate
    name, so it should only be invoked for incidents that actually need it
    (see daily_update.py: only when match_jurisdiction() returned None and
    the incident isn't excluded), not as part of a tight loop over an
    already-large batch.
    """
    for candidate in _candidate_localities(raw_text):
        coords = geocoding_service.geocode(candidate)
        if coords:
            return candidate
    return None


def extract_incident(raw_text: str, title: str) -> dict:
    excluded, reason = should_exclude(raw_text)

    if not excluded and not is_crime_related(raw_text):
        excluded, reason = True, "not identifiably about a crime"

    if excluded:
        return {
            "title": title,
            "description": raw_text[:500],
            "jurisdiction": None,
            "crime_category": None,
            "severity": None,
            "time_of_day": None,
            "is_crime_related": False,
            "is_ongole_related": is_ongole_related(raw_text),
            "exclusion_reason": reason,
        }

    return {
        "title": title,
        "description": raw_text[:500],
        "jurisdiction": match_jurisdiction(raw_text),
        "crime_category": match_category(raw_text),
        "severity": match_severity(raw_text),
        "time_of_day": match_time_of_day(raw_text),
        "is_crime_related": True,
        "is_ongole_related": is_ongole_related(raw_text),
        "exclusion_reason": None,
    }