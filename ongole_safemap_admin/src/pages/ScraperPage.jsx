import { useEffect, useState, useCallback } from "react";
import { getScraperLogs } from "../api/scraperApi";
import ScraperTriggerButton from "../components/scraper/ScraperTriggerButton";
import ScraperLogsTable from "../components/scraper/ScraperLogsTable";

function ScraperPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getScraperLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-800">Scraper</h1>

      <ScraperTriggerButton onComplete={load} />

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-semibold text-zinc-700 mb-2">Run history</p>
        <ScraperLogsTable logs={logs} loading={loading} />
      </div>
    </div>
  );
}

export default ScraperPage;