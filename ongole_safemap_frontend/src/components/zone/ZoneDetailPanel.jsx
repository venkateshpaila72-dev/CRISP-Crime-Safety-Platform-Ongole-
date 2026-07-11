import CrimeScoreBadge from "./CrimeScoreBadge";
import CategoryBreakdown from "./CategoryBreakdown";
import SafetyTipsList from "./SafetyTipsList";
import IncidentsList from "./IncidentsList";

function ZoneDetailPanel({
  zone,
  onClose,
}) {
  if (!zone) return null;

  const crimeScore = zone.crime_score || {};

  const topCategories = Object.entries(
    crimeScore.category_breakdown || {}
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  return (
    <div className="absolute top-4 right-4 z-[1000] w-[380px] max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">

      <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold">
            {zone.name}
          </h2>

          <p className="text-sm text-gray-500">
            Crime Analytics
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-md p-2 hover:bg-gray-100 transition"
        >
          ✕
        </button>

      </div>

      <div className="p-5 space-y-5">

        <CrimeScoreBadge
          crimeScore={crimeScore}
        />

        <CategoryBreakdown
          categoryBreakdown={
            crimeScore.category_breakdown || {}
          }
          totalIncidents={
            crimeScore.total_incidents || 0
          }
        />

        <SafetyTipsList
          categories={topCategories}
        />

        <IncidentsList
          zoneId={zone.zone_id}
        />

      </div>

    </div>
  );
}

export default ZoneDetailPanel;