const STYLES = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  default: "bg-zinc-100 text-zinc-600",
};

function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.default;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}

export default StatusBadge;