// Generic pulsing placeholder used anywhere data is being fetched.
// `lines` controls how many bars render, each one a bit shorter than the
// last so it doesn't look like a rigid table.
function LoadingSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-zinc-200"
          style={{ width: `${Math.max(30, 90 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}

export default LoadingSkeleton;