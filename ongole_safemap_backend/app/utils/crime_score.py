from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Dict, List

# -------------------------------
# CONFIGURATION
# -------------------------------

SEVERITY_WEIGHTS = {
    "High": 5,
    "Medium": 3,
    "Low": 1,
}

RECENT_DAYS = 30

RISK_THRESHOLDS = {
    "VERY_HIGH": 80,
    "HIGH": 60,
    "MEDIUM": 35,
    "LOW": 15,
}

# Used only by assign_risk_labels() for RELATIVE scoring (see below) — these
# are fractions of the current dataset's own max score, not absolute points.
RELATIVE_RISK_THRESHOLDS = {
    "VERY_HIGH": 0.80,
    "HIGH": 0.55,
    "MEDIUM": 0.30,
    "LOW": 0.10,
}


# -------------------------------
# HELPERS
# -------------------------------

def _parse_date(value):
    if value is None:
        return None

    if isinstance(value, datetime):
        return value

    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except Exception:
        return None


def calculate_zone_statistics(incidents: List[Dict]) -> Dict:

    total = len(incidents)

    if total == 0:
        return {
            "crime_score": 0,
            "risk": "SAFE",
            "incident_count": 0,
            "severity_breakdown": {
                "High": 0,
                "Medium": 0,
                "Low": 0
            },
            "category_breakdown": {},
            "recent_incidents": 0
        }

    severity_counter = Counter()

    category_counter = Counter()

    score = 0

    recent_bonus = 0

    now = datetime.now(timezone.utc)

    for incident in incidents:

        # NOTE: dict.get(key, default) only applies the default when the KEY
        # is missing — it does NOT catch an explicit None value, which is
        # exactly what's stored for incidents where extraction found no
        # match. Using `or` here catches both cases correctly.
        severity = incident.get("severity") or "Low"

        severity_counter[severity] += 1

        category = incident.get("crime_category") or "Other"

        category_counter[category] += 1

        score += SEVERITY_WEIGHTS.get(severity, 1)

        published = _parse_date(
            incident.get("published_date")
        )

        if published:

            if published.tzinfo is None:
                published = published.replace(
                    tzinfo=timezone.utc
                )

            if published >= now - timedelta(days=RECENT_DAYS):

                recent_bonus += 2

    score += recent_bonus

    repeat_bonus = max(0, total - 10)

    score += repeat_bonus

    crime_score = min(100, score)

    if crime_score >= RISK_THRESHOLDS["VERY_HIGH"]:

        risk = "VERY HIGH"

    elif crime_score >= RISK_THRESHOLDS["HIGH"]:

        risk = "HIGH"

    elif crime_score >= RISK_THRESHOLDS["MEDIUM"]:

        risk = "MEDIUM"

    elif crime_score >= RISK_THRESHOLDS["LOW"]:

        risk = "LOW"

    else:

        risk = "SAFE"

    return {

        "crime_score": crime_score,

        "risk": risk,

        "incident_count": total,

        "severity_breakdown": dict(severity_counter),

        "category_breakdown": dict(category_counter),

        "recent_incidents": recent_bonus // 2

    }


def assign_risk_labels(stats_by_locality: Dict[str, Dict]) -> Dict[str, Dict]:
    """
    Recomputes each zone's `risk` label RELATIVE to the other zones in the
    CURRENT dataset, replacing whatever calculate_zone_statistics() set
    using the fixed absolute RISK_THRESHOLDS.

    Why this exists: RISK_THRESHOLDS assumes crime_score values that reach
    well into the 15-80+ range. With real per-zone incident counts as low
    as 1-10 (which is what this dataset actually has right now), raw scores
    rarely clear even the "LOW" cutoff of 15 — so every zone silently comes
    back "SAFE" and the map renders all grey, regardless of whether one zone
    genuinely has 10x the incidents of another. Scoring each zone against
    this run's own max score (not an arbitrary fixed number) fixes that
    without inventing or inflating any data.

    Input/output shape: {locality_name: stats_dict}, where stats_dict is
    whatever calculate_zone_statistics() returned for that locality. Same
    dict is returned with "risk" overwritten; nothing else is touched.

    Zones with zero incidents always stay "SAFE" — that's a real, correct
    signal (nothing reported there), not a case of insufficient data.
    """
    scored_zones = [
        (locality, stats["crime_score"])
        for locality, stats in stats_by_locality.items()
        if stats.get("incident_count", 0) > 0
    ]

    if not scored_zones:
        return stats_by_locality

    max_score = max(score for _, score in scored_zones)
    if max_score <= 0:
        return stats_by_locality

    for locality, stats in stats_by_locality.items():
        if stats.get("incident_count", 0) == 0:
            stats["risk"] = "SAFE"
            continue

        relative_pct = stats["crime_score"] / max_score

        if relative_pct >= RELATIVE_RISK_THRESHOLDS["VERY_HIGH"]:
            stats["risk"] = "VERY HIGH"
        elif relative_pct >= RELATIVE_RISK_THRESHOLDS["HIGH"]:
            stats["risk"] = "HIGH"
        elif relative_pct >= RELATIVE_RISK_THRESHOLDS["MEDIUM"]:
            stats["risk"] = "MEDIUM"
        elif relative_pct >= RELATIVE_RISK_THRESHOLDS["LOW"]:
            stats["risk"] = "LOW"
        else:
            stats["risk"] = "SAFE"

    return stats_by_locality