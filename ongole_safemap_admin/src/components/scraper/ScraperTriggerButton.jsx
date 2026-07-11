import { useState } from "react";
import { triggerScraper } from "../../api/scraperApi";

function ScraperTriggerButton({ onComplete }) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const handleTrigger = async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await triggerScraper();
      setLastResult(result);
      onComplete?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Scraper run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-700">Manual scraper run</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Fetches recent RSS coverage, extracts + filters incidents, updates zone scores.
            Can take a minute or two — RSS parsing and image fetches run live.
          </p>
        </div>
        <button
          disabled={running}
          onClick={handleTrigger}
          className="flex-shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {running ? "Running…" : "Trigger scrape"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {lastResult && !error && (
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm">
          <p className="font-medium text-zinc-700">
            {lastResult.status === "completed" ? "Completed" : "Completed with errors"}
          </p>
          <p className="text-zinc-500">
            {lastResult.articles_found} articles found · {lastResult.incidents_added} incidents added
          </p>
          {lastResult.errors?.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-xs text-red-500">
              {lastResult.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ScraperTriggerButton;