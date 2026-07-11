import { useCallback, useEffect, useState } from "react";
import { listIncidents } from "../api/incidentsApi";
import { getJurisdictions } from "../api/contentApi";
import IncidentsTable from "../components/incidents/IncidentsTable";
import IncidentEditModal from "../components/incidents/IncidentEditModal";
import BulkDeleteControls from "../components/incidents/BulkDeleteControls";
import ExcludedIncidentsView from "../components/incidents/ExcludedIncidentsView";

const CRIME_CATEGORIES = [
  "Assault",
  "Burglary",
  "Chain Snatching",
  "Harassment",
  "Murder",
  "Robbery",
  "Theft",
  "Vehicle Theft",
  "Other",
];

function IncidentsPage() {
  const [tab, setTab] = useState("active"); // "active" | "excluded"
  const [incidents, setIncidents] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [jurisdictionFilter, setJurisdictionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadIncidents = useCallback(async () => {
    setError(null);
    try {
      const data = await listIncidents({
        jurisdiction: jurisdictionFilter || undefined,
        crimeCategory: categoryFilter || undefined,
      });
      setIncidents(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load incidents.");
    }
  }, [jurisdictionFilter, categoryFilter]);

  useEffect(() => {
    getJurisdictions()
      .then(setJurisdictions)
      .catch(() => setJurisdictions([]));
  }, []);

  useEffect(() => {
    if (tab !== "active") return;
    setLoading(true);
    loadIncidents().finally(() => setLoading(false));
  }, [tab, loadIncidents]);

  function handleSaved(updated) {
    setIncidents((prev) =>
      updated.exclusion_reason
        ? prev.filter((i) => i._id !== updated._id) // just got excluded
        : prev.map((i) => (i._id === updated._id ? updated : i))
    );
    setSelected(null);
  }

  function handleDeleted(id) {
    setIncidents((prev) => prev.filter((i) => i._id !== id));
    setSelected(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-zinc-200">
        {[
          { key: "active", label: "Active" },
          { key: "excluded", label: "Excluded" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600"
                : "px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "excluded" ? (
        <ExcludedIncidentsView />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-zinc-200 p-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label
                className="text-sm text-zinc-600"
                htmlFor="jurisdiction-filter"
              >
                Jurisdiction
              </label>
              <select
                id="jurisdiction-filter"
                value={jurisdictionFilter}
                onChange={(e) => setJurisdictionFilter(e.target.value)}
                className="rounded-md border border-zinc-300 text-sm px-2 py-1.5"
              >
                <option value="">All</option>
                {jurisdictions.map((j) => (
                  <option key={j.zone_id} value={j.name}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-600" htmlFor="category-filter">
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-zinc-300 text-sm px-2 py-1.5"
              >
                <option value="">All</option>
                {CRIME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading incidents…</p>
          ) : error ? (
            <p className="text-sm text-risk-high">{error}</p>
          ) : (
            <IncidentsTable incidents={incidents} onRowClick={setSelected} />
          )}

          <BulkDeleteControls onDeleted={loadIncidents} />

          <IncidentEditModal
            incident={selected}
            onClose={() => setSelected(null)}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        </>
      )}
    </div>
  );
}

export default IncidentsPage;