import { useCallback, useEffect, useState } from "react";
import { getSafetyTips } from "../api/publicApi";

export function useSafetyTips(categories = []) {

  const [tips, setTips] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [retryToken, setRetryToken] = useState(0);

  const categoriesKey = categories.join("|");

  useEffect(() => {

    let cancelled = false;

    setLoading(true);

    setError(null);

    const request =
      categories.length > 0
        ? Promise.all(
            categories.map(category =>
              getSafetyTips({ category })
            )
          ).then(results => {

            const merged = results.flat();

            const seen = new Set();

            return merged.filter(tip => {

              const key = tip.id || tip._id;

              if (seen.has(key)) return false;

              seen.add(key);

              return true;

            });

          })
        : getSafetyTips();

    request
      .then(data => {

        if (!cancelled) {

          setTips(data);

        }

      })
      .catch(err => {

        if (!cancelled) {

          setError(err?.response?.data?.detail || err.message || "Failed to load safety tips");

        }

      })
      .finally(() => {

        if (!cancelled) {

          setLoading(false);

        }

      });

    return () => {

      cancelled = true;

    };

  }, [categoriesKey, retryToken]);

  const refetch = useCallback(() => setRetryToken(t => t + 1), []);

  return {

    tips,

    loading,

    error,

    refetch,

  };

}