import { useCallback, useEffect, useState } from "react";
import { getReports, reviewReport } from "../api/reportsApi";
import ReportsTable from "../components/reports/ReportsTable";
import ReportReviewModal from "../components/reports/ReportReviewModal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function ReportsPage() {
  const [tab, setTab] = useState("pending");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(tab);
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (id, action) => {
    await reviewReport(id, action);
    await load();
  };

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-800">Reports</h1>

      <div className="mt-4 flex gap-1 border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        {loading && <LoadingSkeleton rows={5} />}
        {error && <p className="py-8 text-center text-sm text-red-500">{error}</p>}
        {!loading && !error && <ReportsTable reports={reports} onSelect={setSelected} />}
      </div>

      <ReportReviewModal
        report={selected}
        onClose={() => setSelected(null)}
        onReview={handleReview}
      />
    </div>
  );
}

export default ReportsPage;