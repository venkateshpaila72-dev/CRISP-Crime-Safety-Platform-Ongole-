import { MapContainer, TileLayer } from "react-leaflet";
import { useMemo, useState, useRef } from "react";

import { useZones } from "../../hooks/useZones";
import { useLandmarks } from "../../hooks/useLandmarks";

import ZoneMarker from "./ZoneMarker";
import LandmarkMarker from "./LandmarkMarker";
import SearchBar from "./SearchBar";
import MapLegend from "./MapLegend";

const ONGOLE_CENTER = [15.5057, 80.0499];

function MapView({ onZoneSelect, selectedZone }) {
    const { zones, loading, error } = useZones();
    const { landmarks } = useLandmarks();

    const [search, setSearch] = useState("");
    const [showLandmarks, setShowLandmarks] = useState(true);

    const mapRef = useRef(null);

    const searchResults = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return [];

        const zoneMatches = zones
            .filter((z) => z.name.toLowerCase().includes(query))
            .map((z) => ({ kind: "zone", id: z.zone_id, ...z }));

        const landmarkMatches = landmarks
            .filter((l) => l.name.toLowerCase().includes(query))
            .map((l) => ({ kind: "landmark", id: l._id, ...l }));

        return [...zoneMatches, ...landmarkMatches].slice(0, 8);
    }, [search, zones, landmarks]);

    const flyTo = (lat, lng, zoom = 16) => {
        if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], zoom, { duration: 1 });
        }
    };

    const handleSelectResult = (result) => {
        if (result.kind === "zone") {
            onZoneSelect(result);
            flyTo(result.latitude, result.longitude);
        } else {
            flyTo(result.latitude, result.longitude, 17);
        }
        setSearch("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-lg">Loading Map...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <MapContainer
                ref={mapRef}
                center={ONGOLE_CENTER}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {zones.map((zone) => (
                    <ZoneMarker
                        key={zone.zone_id}
                        zone={zone}
                        onSelect={onZoneSelect}
                        isSelected={selectedZone?.zone_id === zone.zone_id}
                    />
                ))}

                {showLandmarks &&
                    landmarks.map((landmark) => (
                        <LandmarkMarker key={landmark._id} landmark={landmark} />
                    ))}
            </MapContainer>

            <SearchBar
                value={search}
                onChange={setSearch}
                results={searchResults}
                onSelectResult={handleSelectResult}
                showResults={true}
            />

            <button
                onClick={() => setShowLandmarks((prev) => !prev)}
                className="absolute top-4 right-4 z-[1000] bg-white rounded-full shadow-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
                {showLandmarks ? "Hide landmarks" : "Show landmarks"}
            </button>

            <MapLegend />
        </div>
    );
}

export default MapView;