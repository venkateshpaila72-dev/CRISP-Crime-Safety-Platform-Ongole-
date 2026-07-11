import { useState } from "react";
import { submitReport } from "../../api/publicApi";
import ErrorMessage from "../common/ErrorMessage";

// Mirrors app.schemas.common.CrimeCategory exactly — values are sent
// as-is to the backend enum, so these strings must stay in sync with it.
const CATEGORIES = [
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

function ReportIncidentForm({ zones = [], onSuccess, onCancel }) {
  const [form, setForm] = useState({
    reporter_name: "",
    description: "",
    category: "",
    zone: "",
    latitude: "",
    longitude: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const validate = () => {
    const next = {};

    const description = form.description.trim();
    if (description.length < 10) {
      next.description = "Please describe what happened (at least 10 characters).";
    } else if (description.length > 1000) {
      next.description = "Description must be under 1000 characters.";
    }

    if (!form.category) {
      next.category = "Please select a category.";
    }

    if (form.reporter_name.length > 100) {
      next.reporter_name = "Name must be under 100 characters.";
    }

    const lat = parseFloat(form.latitude);
    if (form.latitude === "" || Number.isNaN(lat) || lat < -90 || lat > 90) {
      next.latitude = "Enter a valid latitude between -90 and 90.";
    }

    const lng = parseFloat(form.longitude);
    if (form.longitude === "" || Number.isNaN(lng) || lng < -180 || lng > 180) {
      next.longitude = "Enter a valid longitude between -180 and 180.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = {
        reporter_name: form.reporter_name.trim() || "Anonymous",
        description: form.description.trim(),
        category: form.category,
        zone: form.zone || null,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      const result = await submitReport(payload);
      onSuccess(result);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.detail ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Your name (optional)
        </label>
        <input
          type="text"
          value={form.reporter_name}
          onChange={update("reporter_name")}
          placeholder="Anonymous"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.reporter_name && (
          <p className="text-xs text-red-600 mt-1">{fieldErrors.reporter_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          What happened? *
        </label>
        <textarea
          value={form.description}
          onChange={update("description")}
          rows={4}
          placeholder="Describe the incident..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Category *
        </label>
        <select
          value={form.category}
          onChange={update("category")}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <p className="text-xs text-red-600 mt-1">{fieldErrors.category}</p>
        )}
      </div>

      {zones.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Zone / locality (optional)
          </label>
          <select
            value={form.zone}
            onChange={update("zone")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Not sure</option>
            {zones.map((z) => (
              <option key={z.zone_id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-zinc-700">
            Location *
          </label>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
          >
            {locating ? "Locating..." : "Use my location"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={update("latitude")}
            placeholder="Latitude"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={update("longitude")}
            placeholder="Longitude"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(fieldErrors.latitude || fieldErrors.longitude) && (
          <p className="text-xs text-red-600 mt-1">
            {fieldErrors.latitude || fieldErrors.longitude}
          </p>
        )}
      </div>

      {submitError && <ErrorMessage message={submitError} />}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
}

export default ReportIncidentForm;