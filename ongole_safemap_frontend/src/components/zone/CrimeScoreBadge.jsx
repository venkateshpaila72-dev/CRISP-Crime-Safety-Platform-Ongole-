import { getRiskColor, getRiskDisplayLabel } from "../../utils/riskColors";

function CrimeScoreBadge({ crimeScore }) {
  const riskLabel = crimeScore?.risk_label;
  const color = getRiskColor(riskLabel);
  const displayLabel = getRiskDisplayLabel(riskLabel);
  const isInsufficient = crimeScore?.confidence === "Insufficient";

  return (
    <div className="rounded-lg border border-zinc-200 p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="font-semibold text-zinc-800">{displayLabel}</span>
      </div>

      {isInsufficient ? (
        <p className="text-sm text-zinc-500 mt-2">
          Not enough recorded incidents in this zone to assess risk yet.
          This means the data is limited — not that the area is confirmed safe.
        </p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-sm">
          <dt className="text-zinc-500">Total incidents</dt>
          <dd className="text-zinc-800 font-medium text-right">
            {crimeScore.total_incidents}
          </dd>

          <dt className="text-zinc-500">High severity</dt>
          <dd className="text-zinc-800 font-medium text-right">
            {crimeScore.high_severity_pct}%
          </dd>

          <dt className="text-zinc-500">Confidence</dt>
          <dd className="text-zinc-800 font-medium text-right">
            {crimeScore.confidence}
          </dd>
        </dl>
      )}
    </div>
  );
}

export default CrimeScoreBadge;