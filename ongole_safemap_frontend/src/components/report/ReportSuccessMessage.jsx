function ReportSuccessMessage({ report, onClose }) {
  return (
    <div className="text-center py-4 space-y-3">
      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
        ✓
      </div>

      <h3 className="text-lg font-bold text-zinc-800">Report submitted</h3>

      <p className="text-sm text-zinc-500 px-2">
        Thank you — your report has been received and is pending review
        before it appears on the map.
      </p>

      {report?.submitted_at && (
        <p className="text-xs text-zinc-400">
          Submitted {new Date(report.submitted_at).toLocaleString()}
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        Done
      </button>
    </div>
  );
}

export default ReportSuccessMessage;