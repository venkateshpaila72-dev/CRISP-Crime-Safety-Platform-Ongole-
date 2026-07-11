import StatusBadge from "../common/StatusBadge";
import { formatDateTime } from "../../utils/formatters";

function ReportsTable({ reports, onSelect }) {
  if (reports.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-400">No reports in this view.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
          <th className="py-2 pr-3">Category</th>
          <th className="py-2 pr-3">Zone</th>
          <th className="py-2 pr-3">Submitted</th>
          <th className="py-2 pr-3">Status</th>
          <th className="py-2" />
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr
            key={r._id}
            onClick={() => onSelect(r)}
            className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50"
          >
            <td className="py-2 pr-3 font-medium text-zinc-800">{r.category}</td>
            <td className="py-2 pr-3 text-zinc-600">{r.zone || "—"}</td>
            <td className="py-2 pr-3 text-zinc-500">{formatDateTime(r.submitted_at)}</td>
            <td className="py-2 pr-3"><StatusBadge status={r.status} /></td>
            <td className="py-2 text-right text-zinc-400">Review →</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ReportsTable;