import { useState } from "react";
import { bulkDeleteIncidents } from "../../api/incidentsApi";
import ConfirmDialog from "../common/ConfirmDialog";

const SOURCE_OPTIONS = ["seed", "scraper"];

// lockExcludedOnly: used by ExcludedIncidentsView, where "excluded only"
// is always true and shouldn't be a toggleable option.
function BulkDeleteControls({ lockExcludedOnly = false, onDeleted }) {
  const [source, setSource] = useState("");
  const [excludedOnly, setExcludedOnly] = useState(lockExcludedOnly);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  // Backend refuses to run with no filter at all — mirror that here so
  // the button can't even be clicked into a guaranteed 400.
  const hasFilter = Boolean(source) || excludedOnly;

  async function handleConfirmDelete() {
    setDeleting(true);
    setMessage(null);
    try {
      const result = await bulkDeleteIncidents({
        source: source || undefined,
        excludedOnly: excludedOnly || undefined,
      });
      setMessage(`Deleted ${result.deleted_count} incident(s).`);
      onDeleted?.(result);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Bulk delete failed.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-600" htmlFor="bulk-source">
          Source
        </label>
        <select
          id="bulk-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-md border border-zinc-300 text-sm px-2 py-1.5"
        >
          <option value="">Any</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {!lockExcludedOnly && (
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={excludedOnly}
            onChange={(e) => setExcludedOnly(e.target.checked)}
          />
          Excluded only
        </label>
      )}

      <button
        type="button"
        disabled={!hasFilter || deleting}
        onClick={() => setConfirmOpen(true)}
        className="ml-auto rounded-lg bg-risk-high px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {deleting ? "Deleting…" : "Bulk Delete"}
      </button>

      {message && <p className="w-full text-sm text-zinc-500">{message}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Bulk delete incidents"
        message={`This permanently deletes every incident matching: source = ${
          source || "any"
        }, excluded only = ${excludedOnly}. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default BulkDeleteControls;