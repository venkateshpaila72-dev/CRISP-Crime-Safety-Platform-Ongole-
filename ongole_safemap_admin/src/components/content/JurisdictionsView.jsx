import { useEffect, useState } from "react";
import { getJurisdictions } from "../../api/contentApi";

function JurisdictionsView() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJurisdictions()
      .then(setZones)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm font-semibold text-zinc-700">
        Current jurisdictions ({zones.length})
      </p>
      <p className="text-xs text-zinc-400 mt-0.5">
        Read-only — these are derived live from incident data, not editable here.
      </p>
      {loading ? (
        <p className="mt-3 text-sm text-zinc-400">Loading…</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {zones.map((z) => (
            <span
              key={z.zone_id}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
            >
              {z.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default JurisdictionsView;