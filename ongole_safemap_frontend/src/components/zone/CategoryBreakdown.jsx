function CategoryBreakdown({ categoryBreakdown, totalIncidents }) {
  const entries = Object.entries(categoryBreakdown || {}).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div>
        <p className="text-sm font-semibold text-zinc-700 mb-1">Incident categories</p>
        <p className="text-sm text-zinc-500">No category data available for this zone yet.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-zinc-700 mb-2">Incident categories</p>
      <div className="flex flex-col gap-2">
        {entries.map(([category, count]) => {
          const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;
          return (
            <div key={category}>
              <div className="flex items-center justify-between text-xs text-zinc-600 mb-0.5">
                <span>{category}</span>
                <span>{count}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryBreakdown;