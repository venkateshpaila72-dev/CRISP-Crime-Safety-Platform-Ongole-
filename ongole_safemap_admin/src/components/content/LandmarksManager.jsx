import { useEffect, useState } from "react";
import {
  getLandmarks, createLandmark, updateLandmark, deleteLandmark, getJurisdictions,
} from "../../api/contentApi";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSkeleton from "../common/LoadingSkeleton";

const TYPES = ["police_station", "hospital", "help_desk"];
const EMPTY_FORM = { name: "", type: "police_station", zone: "", latitude: "", longitude: "" };

function LandmarksManager() {
  const [landmarks, setLandmarks] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getLandmarks(), getJurisdictions()])
      .then(([lm, zn]) => {
        setLandmarks(lm);
        setZones(zn);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (lm) => {
    setEditingId(lm._id);
    setForm({
      name: lm.name, type: lm.type, zone: lm.zone,
      latitude: lm.latitude, longitude: lm.longitude,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
    };
    try {
      if (editingId) {
        await updateLandmark(editingId, payload);
      } else {
        await createLandmark(payload);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save landmark");
    }
  };

  const handleDelete = async () => {
    await deleteLandmark(pendingDelete);
    setPendingDelete(null);
    load();
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm font-semibold text-zinc-700">Landmarks</p>

      <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <input
          required placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="col-span-2 rounded-md border border-zinc-300 px-2 py-1.5 text-sm sm:col-span-1"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        >
          {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
        </select>
        <select
          required value={form.zone}
          onChange={(e) => setForm({ ...form, zone: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="">Zone…</option>
          {zones.map((z) => <option key={z.zone_id} value={z.name}>{z.name}</option>)}
        </select>
        <input
          required type="number" step="any" placeholder="Latitude" value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        />
        <div className="flex gap-1">
          <input
            required type="number" step="any" placeholder="Longitude" value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
          <button type="submit" className="rounded-md bg-brand px-3 text-sm font-medium text-white">
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
        <table className="mt-4 w-full text-sm">
          <tbody>
            {landmarks.map((lm) => (
              <tr key={lm._id} className="border-t border-zinc-100">
                <td className="py-2 font-medium text-zinc-800">{lm.name}</td>
                <td className="py-2 text-zinc-500">{lm.type.replace("_", " ")}</td>
                <td className="py-2 text-zinc-500">{lm.zone}</td>
                <td className="py-2 text-right">
                  <button onClick={() => startEdit(lm)} className="text-xs font-medium text-brand mr-3">
                    Edit
                  </button>
                  <button onClick={() => setPendingDelete(lm._id)} className="text-xs font-medium text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this landmark?"
        danger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

export default LandmarksManager;