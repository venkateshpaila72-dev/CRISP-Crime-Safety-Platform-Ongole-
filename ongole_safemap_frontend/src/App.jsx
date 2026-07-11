import { useState } from "react";
import MapView from "./components/map/MapView";
import ZoneDetailPanel from "./components/zone/ZoneDetailPanel";
import ChatWidget from "./components/assistant/ChatWidget";

function App() {
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <MapView onZoneSelect={setSelectedZone} selectedZone={selectedZone} />

      <ZoneDetailPanel
        key={selectedZone?.zone_id}
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
      />

      <ChatWidget onZoneSelect={setSelectedZone} />
    </div>
  );
}

export default App;