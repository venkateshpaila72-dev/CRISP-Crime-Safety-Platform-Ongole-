"""
Extracts candidate locality names from article text that the static
LOCALITY_KEYWORDS gazetteer doesn't recognize. Andhra Pradesh locality
names reliably follow a small set of naming patterns (Palem, Peta, Nagar,
Puram, Gunta, Cheruvu, Kunta, Colony), so we look for capitalized words
ending in those suffixes rather than trying to match an exhaustive list.
"""

import re

LOCALITY_SUFFIXES = [
    "palem", "peta", "nagar", "puram", "gunta", "cheruvu", "kunta",
    "colony", "pet", "padu", "varipalem", "vari palem",
]

_PATTERN = re.compile(
    r"\b([A-Z][a-zA-Z]*(?:\s[A-Z][a-zA-Z]*)?(?:"
    + "|".join(s.capitalize() for s in LOCALITY_SUFFIXES)
    + r"))\b"
)

STOPWORDS = {"Ongole", "Prakasam", "Andhra Pradesh", "India", "Google"}


def extract_candidate_localities(text: str) -> list[str]:
    matches = _PATTERN.findall(text)
    seen = set()
    candidates = []
    for m in matches:
        cleaned = m.strip()
        if cleaned in STOPWORDS or len(cleaned) < 4:
            continue
        if cleaned not in seen:
            seen.add(cleaned)
            candidates.append(cleaned)
    return candidates