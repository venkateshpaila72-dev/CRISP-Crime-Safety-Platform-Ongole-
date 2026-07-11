import { useCallback, useEffect, useState } from "react";
import { getZones } from "../api/publicApi";
import useLiveZones from "./useLiveZones";

export function useZones() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadZones = useCallback(async () => {
        try {
            const data = await getZones();

            const sorted = [...data].sort((a, b) => {
                const scoreA =
                    a.crime_score?.raw_weighted_score ?? 0;

                const scoreB =
                    b.crime_score?.raw_weighted_score ?? 0;

                return scoreB - scoreA;
            });

            setZones(sorted);

            setError(null);
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.detail ||
                err.message ||
                "Unable to load zones."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadZones();
    }, [loadZones]);

    useLiveZones(loadZones);

    return {
        zones,
        loading,
        error,
        refreshZones: loadZones,
    };
}
