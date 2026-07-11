import { useCallback, useEffect, useState } from "react";
import { listIncidents } from "../../api/incidentsApi";
import IncidentsTable from "./IncidentsTable";
import IncidentEditModal from "./IncidentEditModal";
import BulkDeleteControls from "./BulkDeleteControls";

// Self-contained: fetches its own data (excluded_only=true) rather than
// taking incidents as a prop, so IncidentsPage can mount/unmount it via
// a tab without juggling two incident lists itself.
function ExcludedIncidentsView() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await listIncidents({ excludedOnly: true });
      setIncidents(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to load excluded incidents."
      );
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  function handleSaved(updated) {
    // Restoring (exclusion_reason cleared) removes it from this list;
    // any other edit just updates it in place.
    setIncidents((prev) =>
      updated.exclusion_reason
        ? prev.map((i) => (i._id === updated._id ? updated : i))
        : prev.filter((i) => i._id !== updated._id)
    );
    setSelected(null);
  }

  function handleDeleted(id) {
    setIncidents((prev) => prev.filter((i) => i._id !== id));
    setSelected(null);
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading excluded incidents…</p>;
  }

  if (error) {
    return <p className="text-sm text-risk-high">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">
        Incidents the scraper filtered out as noise (accidents, admin news,
        court coverage, wrong-locality mentions). Click one and uncheck
        "Excluded" to restore it if it was filtered by mistake.
      </p>

      <BulkDeleteControls lockExcludedOnly onDeleted={load} />

      <IncidentsTable
        incidents={incidents}
        onRowClick={setSelected}
        emptyMessage="No excluded incidents."
      />

      <IncidentEditModal
        incident={selected}
        onClose={() => setSelected(null)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

export default ExcludedIncidentsView;