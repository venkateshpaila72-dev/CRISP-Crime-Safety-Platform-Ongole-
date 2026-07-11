// Renders the 10 most recent admin actions from DashboardStats.recent_admin_actions
// (each shaped like AuditLogOut on the backend). Timestamp formatting is inline
// for now with a plain toLocaleString — utils/formatters.js lands in Phase 8 and
// this can switch over to a shared helper then.
//
// Note: AuditLogOut declares `id: str = Field(alias="_id")`, and FastAPI
// serializes response models by alias by default, so the real JSON key is
// `_id`, not `id`. Fixed below (was `entry.id` — always undefined).

function formatAction(action) {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function RecentActionsLog({ actions }) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4">
      <h2 className="text-sm font-medium text-zinc-700 mb-4">
        Recent Admin Actions
      </h2>

      {actions.length === 0 ? (
        <p className="text-sm text-zinc-400 py-8 text-center">
          No admin activity yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {actions.map((entry) => (
            <li
              key={entry._id}
              className="py-2.5 flex items-center justify-between gap-4 text-sm"
            >
              <div className="min-w-0">
                <span className="font-medium text-zinc-800">
                  {formatAction(entry.action)}
                </span>
                <span className="text-zinc-400"> · </span>
                <span className="text-zinc-500">
                  {entry.target_collection}/{entry.target_id}
                </span>
              </div>

              <div className="flex-shrink-0 text-right text-zinc-500">
                <div>{entry.admin_email}</div>
                <div className="text-xs text-zinc-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActionsLog;