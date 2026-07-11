// Backend (app/utils/crime_score.py) returns risk_label as one of these
// exact strings — uppercase, with a space in "VERY HIGH". Keys here must
// match verbatim or every zone silently falls back to the gray color.
export const RISK_COLORS = {
  SAFE: "#16a34a",
  LOW: "#65a30d",
  MEDIUM: "#d97706",
  HIGH: "#ea580c",
  "VERY HIGH": "#dc2626",
};

// Human-friendly labels for display (legend, badges) — separate from the
// raw backend keys above so copy changes don't risk breaking the lookup.
export const RISK_DISPLAY_LABELS = {
  SAFE: "Safe",
  LOW: "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH: "High Risk",
  "VERY HIGH": "Very High Risk",
};

export const INSUFFICIENT_DATA_COLOR = "#71717a";
export const INSUFFICIENT_DATA_LABEL = "Insufficient Data";

export const getRiskColor = (riskLabel) =>
  RISK_COLORS[riskLabel] || INSUFFICIENT_DATA_COLOR;

export const getRiskDisplayLabel = (riskLabel) =>
  RISK_DISPLAY_LABELS[riskLabel] || INSUFFICIENT_DATA_LABEL;

export const getRiskRadius = (totalIncidents) => {
  if (!totalIncidents || totalIncidents === 0) return 300;
  if (totalIncidents < 10) return 400;
  if (totalIncidents < 25) return 550;
  return 700;
};