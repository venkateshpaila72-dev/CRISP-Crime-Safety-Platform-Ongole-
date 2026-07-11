"""
Keyword configuration for rule-based incident extraction.
Ported from the Colab notebook, where these were validated against
real Ongole news data (251 articles, 94 correctly excluded as noise).
"""

CRIME_KEYWORDS_MAP = {
    "Murder": ["murder", "homicide", "murdered", "killed him", "killed her", "stabbed to death"],
    "Assault": ["assault", "attacked", "beaten", "thrashed", "attacked with"],
    "Robbery": ["robbery", "robbed", "looted", "held up at"],
    "Theft": ["theft", "stolen", "stole", "pickpocket", "shoplifting"],
    "Chain Snatching": ["chain snatching", "chain snatched", "snatched her chain", "gold chain snatched"],
    "Burglary": ["burglary", "house theft", "broke into", "burgled"],
    "Vehicle Theft": ["bike stolen", "two-wheeler theft", "vehicle theft", "car stolen", "motorcycle stolen"],
    "Harassment": ["harassment", "harassed", "eve teasing", "stalking", "stalked"],
}

SEVERITY_KEYWORDS = {
    "High": ["murder", "homicide", "rape", "kidnap", "gang-rape", "death", "died", "killed"],
    "Medium": ["assault", "robbery", "chain snatching", "burglary", "attacked"],
    "Low": ["theft", "harassment", "pickpocket", "vehicle theft"],
}

TIME_OF_DAY_KEYWORDS = {
    "Morning": ["morning", "am", "dawn"],
    "Afternoon": ["afternoon", "noon"],
    "Evening": ["evening", "dusk"],
    "Night": ["night", "midnight", "late night", "pm"],
}

# --- Exclusion filters, validated in the notebook against real data ---

ACCIDENT_EXCLUSION_KEYWORDS = [
    "road accident", "mishap", "collision", "collided", "overturned", "overturn",
    "crashed", "bus tragedy", "lorry", "tractor", "divider", "hit a", "rammed",
]

LEGAL_PROCEEDING_KEYWORDS = [
    "sentenced", "life imprisonment", "life term", "acquitted", "convicted",
    "court verdict", "death penalty", "awarded the death", "bail plea", "remanded",
]

ADMINISTRATIVE_KEYWORDS = [
    "initiative", "pilot programme", "geo-tagging", "geo-tagged", "launched a",
    "new measures", "safety concerns", "pays respect", "paid tribute", "commemorat",
]

OTHER_PRAKASAM_LOCATIONS = [
    "markapuram", "kondapi", "cumbham", "marripudi", "narasaraopet", "bapatla",
    "repalle", "kandukur", "kanigiri", "darsi", "chirala", "addanki", "throvagunta",
    "bollaram", "sangareddy",
]

# Official police jurisdictions (broad fallback if no specific locality is named)
ONGOLE_ZONE_KEYWORDS = {
    "Ongole One Town": ["one town", "1 town", "i town"],
    "Ongole Two Town": ["two town", "2 town", "ii town"],
    "Ongole Taluka": ["taluka", "rural ongole"],
}

# Specific localities within Ongole — matched BEFORE the broad jurisdiction
# keywords above, so an article naming a specific area gets pinned there
# instead of the generic police-jurisdiction label.
LOCALITY_KEYWORDS = {
    "Gaddalagunta": ["gaddalagunta"],
    "Kothamamidipalem": ["kothamamidipalem", "kothamamidi palem"],
    "East Kammapalem": ["east kammapalem"],
    "Reddipalem": ["reddipalem"],
    "Pernamitta": ["pernamitta"],
    "Mannavaripalem": ["mannavaripalem"],
    "Santhanuthalapadu": ["santhanuthalapadu", "santhanutalapadu"],
    "Chandrapalem": ["chandrapalem"],
    "Boddavaripalem": ["boddavaripalem", "boddu varipalem"],
    "Mangamuru": ["mangamuru"],
    "Vengamukkapalem": ["vengamukka palem", "vengamukkapalem"],
    "Yerajerla": ["yerajerla"],
    "Sarvireddipalem": ["sarvireddipalem"],
    "Thallavaripalem": ["thallavaripalem"],
    "Dasarajupalle": ["dasarajupalle"],
    "Mukthinutalapadu": ["mukthinutalapadu", "mukthi nutalapadu"],
    "Manduvaripalem": ["manduvaripalem"],
    "Karavadi": ["karavadi"],
    "Throvagunta": ["throvagunta"],
    "Chintala": ["chintala"],
    # Added — found repeatedly in real scraped article text but previously unmatched
    "Surveyreddipalem": ["surveyreddipalem", "survey reddipalem"],
    "CS Puram": ["cs puram", "c.s. puram", "chinna sankarapuram"],
    "Trunk Road": ["trunk road"],
    "RTC Complex": ["rtc bus complex", "rtc complex", "rtc bus stand"],
    "Chadalawada": ["chadalawada"],
}

# Approximate coordinates for every recognized zone/locality — needed so a
# newly-discovered locality (found in scraped text but never seeded) can
# still be auto-provisioned as a map marker. These are approximate town-area
# coordinates, not surveyed boundaries.
LOCALITY_COORDINATES = {
    "Ongole One Town": {"latitude": 15.5057, "longitude": 80.0499},
    "Ongole Two Town": {"latitude": 15.5110, "longitude": 80.0560},
    "Ongole Taluka": {"latitude": 15.4989, "longitude": 80.0421},
    "Gaddalagunta": {"latitude": 15.4990, "longitude": 80.0430},
    "Kothamamidipalem": {"latitude": 15.4940, "longitude": 80.0400},
    "East Kammapalem": {"latitude": 15.5000, "longitude": 80.0620},
    "Reddipalem": {"latitude": 15.5140, "longitude": 80.0330},
    "Pernamitta": {"latitude": 15.5180, "longitude": 80.0390},
    "Mannavaripalem": {"latitude": 15.5220, "longitude": 80.0280},
    "Santhanuthalapadu": {"latitude": 15.5130, "longitude": 80.0230},
    "Chandrapalem": {"latitude": 15.5080, "longitude": 80.0180},
    "Boddavaripalem": {"latitude": 15.5040, "longitude": 80.0130},
    "Mangamuru": {"latitude": 15.4940, "longitude": 80.0180},
    "Vengamukkapalem": {"latitude": 15.4850, "longitude": 80.0330},
    "Yerajerla": {"latitude": 15.4780, "longitude": 80.0410},
    "Sarvireddipalem": {"latitude": 15.4840, "longitude": 80.0470},
    "Thallavaripalem": {"latitude": 15.4900, "longitude": 80.0540},
    "Dasarajupalle": {"latitude": 15.5150, "longitude": 80.0660},
    "Mukthinutalapadu": {"latitude": 15.5070, "longitude": 80.0680},
    "Manduvaripalem": {"latitude": 15.5140, "longitude": 80.0600},
    "Karavadi": {"latitude": 15.5220, "longitude": 80.0740},
    "Throvagunta": {"latitude": 15.5250, "longitude": 80.0560},
    "Chintala": {"latitude": 15.4790, "longitude": 80.0620},
    # Added — matches the new LOCALITY_KEYWORDS entries above
    "Surveyreddipalem": {"latitude": 15.5150, "longitude": 80.0350},
    "CS Puram": {"latitude": 15.4970, "longitude": 80.0460},
    "Trunk Road": {"latitude": 15.5030, "longitude": 80.0470},
    "RTC Complex": {"latitude": 15.5057, "longitude": 80.0499},
    "Chadalawada": {"latitude": 15.5090, "longitude": 80.0540},
    # Citywide fallback bucket — explicit entry so it's an intentional
    # design decision, not an implicit fallback buried in zone_service.py
    "Ongole (Citywide / Unspecified)": {"latitude": 15.5057, "longitude": 80.0499},
}