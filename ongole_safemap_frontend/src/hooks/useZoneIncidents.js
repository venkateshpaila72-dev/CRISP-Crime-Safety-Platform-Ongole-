import { useCallback, useEffect, useState } from "react";
import { getZoneIncidents } from "../api/publicApi";

export function useZoneIncidents(zoneId) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!zoneId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getZoneIncidents(zoneId)
      .then((data) => {
        if (!cancelled) setIncidents(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err.message ||
              "Failed to load incidents"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [zoneId, retryToken]);

  const refetch = useCallback(() => setRetryToken((t) => t + 1), []);

  return { incidents, loading, error, refetch };
}