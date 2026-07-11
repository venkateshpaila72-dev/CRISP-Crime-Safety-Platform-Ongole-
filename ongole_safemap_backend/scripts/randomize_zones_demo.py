import json
import requests
from pathlib import Path
from collections import OrderedDict

OUTPUT_FILE = (
    Path(__file__).resolve().parent.parent
    / "app"
    / "data"
    / "ongole_locations.json"
)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Radius around Ongole center (meters)
SEARCH_RADIUS = 25000

# Ongole city center
CENTER_LAT = 15.5057
CENTER_LON = 80.0499


OVERPASS_QUERY = f"""
[out:json][timeout:120];

(
  node(around:{SEARCH_RADIUS},{CENTER_LAT},{CENTER_LON});
  way(around:{SEARCH_RADIUS},{CENTER_LAT},{CENTER_LON});
  relation(around:{SEARCH_RADIUS},{CENTER_LAT},{CENTER_LON});
);

out center tags;
"""


ALLOWED_TAGS = {

    "place",

    "highway",

    "amenity",

    "shop",

    "tourism",

    "railway",

    "building",

    "office",

    "healthcare",

    "historic",

    "landuse",

    "leisure",

    "natural",

    "public_transport",

    "aeroway",

    "waterway",

    "man_made",

    "religion",

}
def download_osm():

    print("Downloading locations from OpenStreetMap...")

    response = requests.post(

        OVERPASS_URL,

        data=OVERPASS_QUERY,

        headers={

            "User-Agent": "Ongole-SafeMap/1.0"

        },

        timeout=180,

    )

    response.raise_for_status()

    return response.json()


def get_coordinates(element):

    if "lat" in element and "lon" in element:

        return element["lat"], element["lon"]

    if "center" in element:

        return (

            element["center"]["lat"],

            element["center"]["lon"],

        )

    return None, None


def normalize_name(name: str):

    if not name:

        return None

    return " ".join(

        word.capitalize()

        for word in name.strip().split()

    )


def build_aliases(name: str):

    aliases = set()

    aliases.add(name)

    aliases.add(name.lower())

    aliases.add(name.replace(" ", ""))

    aliases.add(name.lower().replace(" ", ""))

    aliases.add(name.replace("-", " "))

    aliases.add(name.lower().replace("-", " "))

    aliases.add(name.replace(".", ""))

    aliases.add(name.lower().replace(".", ""))

    return sorted(aliases)
def extract_locations(osm_json):

    locations = OrderedDict()

    for element in osm_json.get("elements", []):

        tags = element.get("tags", {})

        if "name" not in tags:
            continue

        lat, lon = get_coordinates(element)

        if lat is None or lon is None:
            continue

        name = normalize_name(tags["name"])

        if not name:
            continue

        location_type = "other"

        for tag in ALLOWED_TAGS:

            if tag in tags:
                location_type = tag
                break

        aliases = build_aliases(name)

        locations[name] = {

            "name": name,

            "latitude": lat,

            "longitude": lon,

            "type": location_type,

            "aliases": aliases,

            "osm_id": element["id"],

            "osm_type": element["type"],

            "tags": tags,

        }

    return list(locations.values())


def save_locations(locations):

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(

        json.dumps(
            locations,
            indent=2,
            ensure_ascii=False,
        ),

        encoding="utf-8",

    )

    print()

    print("=" * 60)

    print(f"Saved {len(locations)} locations")

    print(OUTPUT_FILE)

    print("=" * 60)
def main():

    print("=" * 60)
    print("ONGOLE LOCATION DATABASE GENERATOR")
    print("=" * 60)

    osm_data = download_osm()

    print(f"Downloaded {len(osm_data.get('elements', []))} OSM elements")

    locations = extract_locations(osm_data)

    locations.sort(
        key=lambda x: (
            x["type"],
            x["name"],
        )
    )

    save_locations(locations)

    print()

    print("Top 20 Locations")

    print("-" * 60)

    for location in locations[:20]:

        print(
            f"{location['type']:<18}"
            f"{location['name']:<40}"
            f"{location['latitude']:.6f}, "
            f"{location['longitude']:.6f}"
        )

    print()

    print("Done ✔")


if __name__ == "__main__":

    main()