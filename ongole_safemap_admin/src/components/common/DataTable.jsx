// Generic table shell — pass `columns` (each with a key/label and an
// optional custom render(row)) and `rows`. No sorting/pagination yet;
// callers filter data before handing it in. Keeps table markup out of
// every feature component.

function DataTable({
  columns,
  rows,
  rowKey = "_id",
  onRowClick,
  emptyMessage = "No data.",
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-400 py-8 text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2 px-3 font-medium whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={
                onRowClick
                  ? "border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition"
                  : "border-b border-zinc-100"
              }
            >
              {columns.map((col) => (
                <td key={col.key} className="py-2 px-3 align-top">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;