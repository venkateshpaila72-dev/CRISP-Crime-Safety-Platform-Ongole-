// Summary numbers from GET /admin/analytics/dashboard, laid out as a
// responsive grid of cards. Pure presentational component — all data
// comes in via props so it's easy to test/reuse.

const CARD_DEFS = [
  { key: "total_incidents", label: "Total Incidents" },
  {
    key: "zones_with_data",
    label: "Zones With Data",
    render: (stats) => `${stats.zones_with_data} / ${stats.total_zones}`,
  },
  { key: "pending_reports", label: "Pending Reports", emphasize: true },
  { key: "approved_reports", label: "Approved Reports" },
  { key: "rejected_reports", label: "Rejected Reports" },
  { key: "total_landmarks", label: "Landmarks" },
  { key: "total_safety_tips", label: "Safety Tips" },
];

function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {CARD_DEFS.map(({ key, label, render, emphasize }) => (
        <div
          key={key}
          className="bg-white rounded-lg border border-zinc-200 p-4 flex flex-col gap-1"
        >
          <span className="text-sm text-zinc-500">{label}</span>
          <span
            className={
              emphasize && stats[key] > 0
                ? "text-2xl font-semibold text-risk-medium"
                : "text-2xl font-semibold text-zinc-800"
            }
          >
            {render ? render(stats) : stats[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;