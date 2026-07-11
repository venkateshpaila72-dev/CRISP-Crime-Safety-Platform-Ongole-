import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// category_breakdown comes back from the backend as a plain
// { "Theft": 12, "Burglary": 5, ... } dict — reshape into the array
// recharts wants, sorted so the biggest category is on top.
function toChartData(categoryBreakdown) {
  return Object.entries(categoryBreakdown || {})
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

function CategoryChart({ categoryBreakdown }) {
  const data = toChartData(categoryBreakdown);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <h2 className="text-sm font-medium text-zinc-700 mb-2">
          Incidents by Category
        </h2>
        <p className="text-sm text-zinc-400 py-8 text-center">
          No categorized incidents yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4">
      <h2 className="text-sm font-medium text-zinc-700 mb-4">
        Incidents by Category
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="category"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: "#f4f4f5" }} />
          <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;