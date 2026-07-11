import { Circle, GeoJSON, Popup } from "react-leaflet";
import {
    getRiskColor,
    getRiskRadius,
} from "../../utils/riskColors";

function ZoneMarker({
    zone,
    onSelect,
    isSelected,
}) {

    const risk =
        zone.crime_score?.risk_label || "SAFE";

    const color =
        getRiskColor(risk);

    const radius =
        getRiskRadius(
            zone.crime_score?.total_incidents || 0
        );

    const style = {

        color,

        fillColor: color,

        fillOpacity: isSelected ? 0.55 : 0.35,

        weight: isSelected ? 3 : 2,

    };

    const popup = (

        <Popup>

            <div className="space-y-1">

                <h3 className="font-semibold">

                    {zone.name}

                </h3>

                <p>

                    Risk :

                    <span className="font-medium">

                        {" "}

                        {risk}

                    </span>

                </p>

                <p>

                    Incidents :

                    {" "}

                    {

                        zone.crime_score
                            ?.total_incidents || 0

                    }

                </p>

                <button
                    className="mt-2 w-full rounded bg-blue-600 px-3 py-1 text-white"
                    onClick={() => onSelect(zone)}
                >
                    View Details
                </button>

            </div>

        </Popup>

    );

    if (zone.polygon_geojson) {

        return (

            <GeoJSON
                data={zone.polygon_geojson}
                style={style}
                eventHandlers={{
                    click: () =>
                        onSelect(zone),
                }}
            >

                {popup}

            </GeoJSON>

        );

    }

    return (

        <Circle
            center={[
                zone.latitude,
                zone.longitude,
            ]}
            radius={radius}
            pathOptions={style}
            eventHandlers={{
                click: () =>
                    onSelect(zone),
            }}
        >

            {popup}

        </Circle>

    );

}

export default ZoneMarker;