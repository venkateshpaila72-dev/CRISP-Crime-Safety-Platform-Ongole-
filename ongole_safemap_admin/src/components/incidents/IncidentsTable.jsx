import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";

const SEVERITY_TONE = { High: "high", Medium: "medium", Low: "low" };

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function IncidentsTable({
  incidents,
  onRowClick,
  emptyMessage = "No incidents found.",
}) {
  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <span className="line-clamp-2 max-w-xs block text-zinc-800">
          {row.title}
        </span>
      ),
    },
    {
      key: "crime_category",
      label: "Category",
      render: (row) =>
        row.crime_category ? (
          <StatusBadge tone="info">{row.crime_category}</StatusBadge>
        ) : (
          "—"
        ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (row) =>
        row.severity ? (
          <StatusBadge tone={SEVERITY_TONE[row.severity] || "neutral"}>
            {row.severity}
          </StatusBadge>
        ) : (
          "—"
        ),
    },
    {
      key: "jurisdiction",
      label: "Jurisdiction",
      render: (row) => row.jurisdiction || "—",
    },
    {
      key: "time_of_day",
      label: "Time",
      render: (row) => row.time_of_day || "—",
    },
    {
      key: "published_date",
      label: "Published",
      render: (row) => formatDate(row.published_date),
    },
    {
      key: "source_name",
      label: "Source",
      render: (row) => row.source_name || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) =>
        row.exclusion_reason ? (
          <StatusBadge tone="neutral">Excluded</StatusBadge>
        ) : (
          <StatusBadge tone="low">Active</StatusBadge>
        ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
      <DataTable
        columns={columns}
        rows={incidents}
        rowKey="_id"
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default IncidentsTable;