// Reusable "nothing to show" placeholder — used instead of an empty div
// so zero-data cases (no incidents, no tips, no reports) read as
// intentional rather than broken.
function EmptyState({ icon = "📭", title = "Nothing here yet", message, className = "" }) {
  return (
    <div className={`text-center py-6 px-3 ${className}`}>
      <div className="text-3xl mb-2" aria-hidden="true">{icon}</div>
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      {message && <p className="text-xs text-zinc-500 mt-1">{message}</p>}
    </div>
  );
}

export default EmptyState;