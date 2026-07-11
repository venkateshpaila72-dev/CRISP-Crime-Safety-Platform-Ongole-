import { useEffect, useState } from "react";
import { updateIncident, deleteIncident } from "../../api/incidentsApi";
import ConfirmDialog from "../common/ConfirmDialog";

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
const SEVERITY_LEVELS = ["Low", "Medium", "High"];
const TIME_OF_DAY_OPTIONS = ["Morning", "Afternoon", "Evening", "Night", "Unknown"];

function IncidentEditModal({ incident, onClose, onSaved, onDeleted }) {
  const [jurisdiction, setJurisdiction] = useState("");
  const [crimeCategory, setCrimeCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [isCrimeRelated, setIsCrimeRelated] = useState(true);
  const [isOngoleRelated, setIsOngoleRelated] = useState(true);
  const [excluded, setExcluded] = useState(false);
  const [exclusionReason, setExclusionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!incident) return;
    setJurisdiction(incident.jurisdiction || "");
    setCrimeCategory(incident.crime_category || "");
    setSeverity(incident.severity || "");
    setTimeOfDay(incident.time_of_day || "");
    setIsCrimeRelated(incident.is_crime_related);
    setIsOngoleRelated(incident.is_ongole_related);
    setExcluded(!!incident.exclusion_reason);
    setExclusionReason(incident.exclusion_reason || "");
    setError(null);
  }, [incident]);

  if (!incident) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);

    // Only include keys that actually changed, so the request stays
    // minimal and relies on the backend's exclude_unset behavior to leave
    // everything else untouched.
    const changes = {};
    if (jurisdiction !== (incident.jurisdiction || ""))
      changes.jurisdiction = jurisdiction || null;
    if (crimeCategory !== (incident.crime_category || ""))
      changes.crime_category = crimeCategory || null;
    if (severity !== (incident.severity || "")) changes.severity = severity || null;
    if (timeOfDay !== (incident.time_of_day || ""))
      changes.time_of_day = timeOfDay || null;
    if (isCrimeRelated !== incident.is_crime_related)
      changes.is_crime_related = isCrimeRelated;
    if (isOngoleRelated !== incident.is_ongole_related)
      changes.is_ongole_related = isOngoleRelated;

    const currentlyExcluded = !!incident.exclusion_reason;
    if (excluded) {
      if (exclusionReason !== (incident.exclusion_reason || "")) {
        changes.exclusion_reason = exclusionReason;
      }
    } else if (currentlyExcluded) {
      // Explicitly clear it (restore). Requires the admin_incidents.py
      // exclude_unset fix — otherwise the backend silently drops this.
      changes.exclusion_reason = null;
    }

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      const updated = await updateIncident(incident._id, changes);
      onSaved(updated);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteIncident(incident._id);
      onDeleted(incident._id);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete incident.");
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-zinc-800 mb-1">
          {incident.title}
        </h2>
        <p className="text-sm text-zinc-500 mb-4 line-clamp-3">
          {incident.description}
        </p>

        {error && <p className="text-sm text-risk-high mb-3">{error}</p>}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Jurisdiction
            </label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full rounded-md border border-zinc-300 text-sm px-2 py-1.5"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Crime Category
            </label>
            <select
              value={crimeCategory}
              onChange={(e) => setCrimeCategory(e.target.value)}
              className="w-full rounded-md border border-zinc-300 text-sm px-2 py-1.5"
            >
              <option value="">—</option>
              {CRIME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-md border border-zinc-300 text-sm px-2 py-1.5"
            >
              <option value="">—</option>
              {SEVERITY_LEVELS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Time of Day
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full rounded-md border border-zinc-300 text-sm px-2 py-1.5"
            >
              <option value="">—</option>
              {TIME_OF_DAY_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={isCrimeRelated}
              onChange={(e) => setIsCrimeRelated(e.target.checked)}
            />
            Crime related
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={isOngoleRelated}
              onChange={(e) => setIsOngoleRelated(e.target.checked)}
            />
            Ongole related
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={excluded}
              onChange={(e) => setExcluded(e.target.checked)}
            />
            Excluded (treated as noise, hidden from the public map)
          </label>
          {excluded && (
            <input
              type="text"
              value={exclusionReason}
              onChange={(e) => setExclusionReason(e.target.value)}
              placeholder="Exclusion reason (e.g. accident, not a crime)"
              className="rounded-md border border-zinc-300 text-sm px-2 py-1.5"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="text-sm font-medium text-risk-high hover:underline"
          >
            Delete incident
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete incident"
        message="This permanently deletes this incident. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

export default IncidentEditModal;