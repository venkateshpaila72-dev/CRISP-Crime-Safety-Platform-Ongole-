import { useEffect, useState } from "react";
import {
  getSafetyTips, createSafetyTip, updateSafetyTip, deleteSafetyTip,
} from "../../api/contentApi";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSkeleton from "../common/LoadingSkeleton";

const CATEGORIES = [
  "Assault", "Burglary", "Chain Snatching", "Harassment", "Murder",
  "Robbery", "Theft", "Vehicle Theft", "Other",
];
const EMPTY_FORM = { category: CATEGORIES[0], tip: "" };

function SafetyTipsManager() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getSafetyTips().then(setTips).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (tip) => {
    setEditingId(tip._id);
    setForm({ category: tip.category, tip: tip.tip });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateSafetyTip(editingId, form);
      } else {
        await createSafetyTip(form);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save tip");
    }
  };

  const handleDelete = async () => {
    await deleteSafetyTip(pendingDelete);
    setPendingDelete(null);
    load();
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm font-semibold text-zinc-700">Safety tips</p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm sm:w-44"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          required minLength={5} maxLength={500} placeholder="Tip text"
          value={form.tip}
          onChange={(e) => setForm({ ...form, tip: e.target.value })}
          className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        />
        <div className="flex gap-1">
          <button type="submit" className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white">
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded-md px-2 text-sm text-zinc-500">
              ✕
            </button>
          )}
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-4"><LoadingSkeleton rows={3} /></div>
      ) : (
        <div className="mt-4 divide-y divide-zinc-100">
          {tips.map((t) => (
            <div key={t._id} className="flex items-start justify-between gap-3 py-2">
              <div>
                <span className="text-xs font-medium text-brand">{t.category}</span>
                <p className="text-sm text-zinc-700">{t.tip}</p>
              </div>
              <div className="flex flex-shrink-0 gap-3">
                <button onClick={() => startEdit(t)} className="text-xs font-medium text-brand">
                  Edit
                </button>
                <button onClick={() => setPendingDelete(t._id)} className="text-xs font-medium text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this safety tip?"
        danger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

export default SafetyTipsManager;