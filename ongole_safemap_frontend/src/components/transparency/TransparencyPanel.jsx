import { useEffect, useState, useCallback } from "react";
import { getTransparency } from "../../api/publicApi";
import LoadingSkeleton from "../common/LoadingSkeleton";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Self-contained: owns its own open/closed state and only fetches once
// the person actually opens it, so it costs nothing on initial map load.
function TransparencyPanel() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const retry = useCallback(() => setRetryToken((t) => t + 1), []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTransparency()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err.message ||
              "Unable to load transparency data."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, retryToken]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-6 right-4 z-[1000] bg-white rounded-full shadow-lg px-4 py-2.5 text-sm font-medium text-zinc-700 hover:shadow-xl transition"
      >
        ℹ️ Data &amp; Sources
      </button>

      {open && (
        <div
          className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/30 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">About This Data</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {loading && <LoadingSkeleton lines={4} />}

            {!loading && error && (
              <ErrorMessage message={error} onRetry={retry} />
            )}

            {!loading && !error && data && data.total_incidents === 0 && (
              <EmptyState
                icon="📊"
                title="No incidents recorded yet"
                message={data.note}
              />
            )}

            {!loading && !error && data && data.total_incidents > 0 && (
              <dl className="text-sm space-y-3">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Total incidents</dt>
                  <dd className="font-medium">{data.total_incidents}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-zinc-500">Zones covered</dt>
                  <dd className="font-medium">{data.zones_covered}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500 flex-shrink-0">Date range</dt>
                  <dd className="font-medium text-right">
                    {formatDate(data.date_range?.earliest)} &ndash;{" "}
                    {formatDate(data.date_range?.latest)}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500 mb-1.5">Sources</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {data.sources.length === 0 ? (
                      <span className="text-zinc-400 text-xs">
                        No sources recorded.
                      </span>
                    ) : (
                      data.sources.map((source) => (
                        <span
                          key={source}
                          className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                        >
                          {source}
                        </span>
                      ))
                    )}
                  </dd>
                </div>

                <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-100">
                  {data.note}
                </p>
              </dl>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default TransparencyPanel;