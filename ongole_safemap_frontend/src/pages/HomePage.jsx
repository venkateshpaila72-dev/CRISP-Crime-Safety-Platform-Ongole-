import { useState } from "react";

import MapView from "../components/map/MapView";
import ZoneDetailPanel from "../components/zone/ZoneDetailPanel";

function HomePage() {

  const [selectedZone, setSelectedZone] = useState(null);

  return (

    <div className="relative h-screen w-screen overflow-hidden">

      <MapView
        selectedZone={selectedZone}
        onZoneSelect={setSelectedZone}
      />

      {selectedZone && (
        <ZoneDetailPanel
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
        />
      )}

    </div>

  );

}

export default HomePage;