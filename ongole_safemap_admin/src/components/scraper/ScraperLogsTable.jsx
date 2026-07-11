import { formatDateTime } from "../../utils/formatters";
import LoadingSkeleton from "../common/LoadingSkeleton";

function ScraperLogsTable({ logs, loading }) {
  if (loading) return <LoadingSkeleton rows={4} />;

  if (logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        No scraper runs yet — logs reset when the backend restarts, since they're kept
        in memory rather than the database.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
          <th className="py-2 pr-3">Triggered</th>
          <th className="py-2 pr-3">By</th>
          <th className="py-2 pr-3">Status</th>
          <th className="py-2 pr-3">Articles</th>
          <th className="py-2 pr-3">Incidents added</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, i) => (
          <tr key={i} className="border-b border-zinc-100">
            <td className="py-2 pr-3 text-zinc-500">{formatDateTime(log.triggered_at)}</td>
            <td className="py-2 pr-3 text-zinc-600">{log.triggered_by}</td>
            <td className="py-2 pr-3">
              <span className={log.status === "completed" ? "text-emerald-600" : "text-amber-600"}>
                {log.status}
              </span>
            </td>
            <td className="py-2 pr-3 text-zinc-800">{log.articles_found}</td>
            <td className="py-2 pr-3 text-zinc-800">{log.incidents_added}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ScraperLogsTable;