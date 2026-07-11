import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const TYPE_CONFIG = {
    police_station: { color: "#2563eb", label: "Police Station", icon: "👮" },
    hospital: { color: "#dc2626", label: "Hospital", icon: "🏥" },
    help_desk: { color: "#16a34a", label: "Help Desk", icon: "ℹ️" },
};

function buildIcon(type) {
    const config = TYPE_CONFIG[type] || { color: "#71717a", icon: "📍" };
    return L.divIcon({
        html: `<div style="
            background:${config.color};
            width:26px;height:26px;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            border:2px solid white;
            box-shadow:0 1px 4px rgba(0,0,0,0.4);
            font-size:13px;
        ">${config.icon}</div>`,
        className: "",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
    });
}

function LandmarkMarker({ landmark }) {
    const config = TYPE_CONFIG[landmark.type] || { label: landmark.type };

    return (
        <Marker
            position={[landmark.latitude, landmark.longitude]}
            icon={buildIcon(landmark.type)}
        >
            <Popup>
                <div className="text-sm">
                    <p className="font-semibold text-zinc-800">{landmark.name}</p>
                    <p className="text-xs text-zinc-500">{config.label}</p>
                </div>
            </Popup>
        </Marker>
    );
}

export default LandmarkMarker;