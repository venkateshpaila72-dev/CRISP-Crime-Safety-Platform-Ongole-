import { useState } from "react";
import { formatDateTime } from "../../utils/formatters";

function ReportReviewModal({ report, onClose, onReview }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!report) return null;

  const handleAction = async (action) => {
    setSubmitting(true);
    setError(null);
    try {
      await onReview(report._id, action);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-zinc-800">Review report</p>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">✕</button>
        </div>

        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-zinc-500">Reporter</dt>
            <dd className="text-zinc-800">{report.reporter_name || "Anonymous"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Category</dt>
            <dd className="text-zinc-800">{report.category}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Zone</dt>
            <dd className="text-zinc-800">{report.zone || "Not specified"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Location</dt>
            <dd className="text-zinc-800">{report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Submitted</dt>
            <dd className="text-zinc-800">{formatDateTime(report.submitted_at)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Description</dt>
            <dd className="text-zinc-800 whitespace-pre-wrap">{report.description}</dd>
          </div>
        </dl>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            disabled={submitting}
            onClick={() => handleAction("reject")}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            disabled={submitting}
            onClick={() => handleAction("approve")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportReviewModal;