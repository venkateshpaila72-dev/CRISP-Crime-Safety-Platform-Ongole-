function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded-md bg-zinc-100" />
      ))}
    </div>
  );
}

export default LoadingSkeleton;