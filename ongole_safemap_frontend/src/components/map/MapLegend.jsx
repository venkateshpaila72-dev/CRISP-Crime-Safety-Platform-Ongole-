import {
  RISK_COLORS,
  RISK_DISPLAY_LABELS,
  INSUFFICIENT_DATA_COLOR,
  INSUFFICIENT_DATA_LABEL,
} from "../../utils/riskColors";

// Order matters here: low risk to high risk, with the "insufficient data"
// case tacked on at the end since it's not really a risk tier.
const LEGEND_ORDER = ["SAFE", "LOW", "MEDIUM", "HIGH", "VERY HIGH"];

function MapLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold mb-2 text-zinc-700 text-xs uppercase tracking-wide">
        Risk Level
      </p>
      <div className="flex flex-col gap-1.5">
        {LEGEND_ORDER.map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: RISK_COLORS[key] }}
            />
            <span className="text-zinc-600">{RISK_DISPLAY_LABELS[key]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: INSUFFICIENT_DATA_COLOR }}
          />
          <span className="text-zinc-600">{INSUFFICIENT_DATA_LABEL}</span>
        </div>
      </div>
    </div>
  );
}

export default MapLegend;