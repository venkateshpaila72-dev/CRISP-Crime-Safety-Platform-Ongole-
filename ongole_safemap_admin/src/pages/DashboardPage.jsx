import { useCallback, useEffect, useState } from "react";
import { getDashboardStats, recomputeZones } from "../api/analyticsApi";
import StatsCards from "../components/analytics/StatsCards";
import CategoryChart from "../components/analytics/CategoryChart";
import RecentActionsLog from "../components/analytics/RecentActionsLog";

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeMessage, setRecomputeMessage] = useState(null);

  const loadStats = useCallback(async () => {
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to load dashboard stats."
      );
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadStats().finally(() => setLoading(false));
  }, [loadStats]);

  async function handleRecompute() {
    setRecomputing(true);
    setRecomputeMessage(null);
    try {
      const result = await recomputeZones();
      await loadStats();
      setRecomputeMessage(
        `Recompute complete${
          result?.zones_updated != null
            ? ` — ${result.zones_updated} zones updated.`
            : "."
        }`
      );
    } catch (err) {
      setRecomputeMessage(
        err?.response?.data?.detail || "Recompute failed."
      );
    } finally {
      setRecomputing(false);
    }
  }

  if (loading) {
    // Plain placeholder for now — utils/formatters + a real
    // LoadingSkeleton component both land in Phase 8.
    return <p className="text-sm text-zinc-500">Loading dashboard…</p>;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-risk-high/30 p-4">
        <p className="text-sm text-risk-high">{error}</p>
        <button
          type="button"
          onClick={loadStats}
          className="mt-3 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          {recomputeMessage && (
            <p className="text-sm text-zinc-500">{recomputeMessage}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRecompute}
          disabled={recomputing}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {recomputing ? "Recomputing…" : "Recompute Zones"}
        </button>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart categoryBreakdown={stats.category_breakdown} />
        <RecentActionsLog actions={stats.recent_admin_actions} />
      </div>
    </div>
  );
}

export default DashboardPage;