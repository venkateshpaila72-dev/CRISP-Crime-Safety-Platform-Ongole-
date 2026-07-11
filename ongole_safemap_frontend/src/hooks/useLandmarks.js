import { useEffect, useState } from "react";
import { getLandmarks } from "../api/publicApi";

export function useLandmarks() {
    const [landmarks, setLandmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        getLandmarks()
            .then((data) => {
                if (!cancelled) setLandmarks(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || "Failed to load landmarks");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { landmarks, loading, error };
}