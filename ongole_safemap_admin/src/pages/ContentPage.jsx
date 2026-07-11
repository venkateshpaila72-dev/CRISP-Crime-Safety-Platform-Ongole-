import { useState } from "react";
import LandmarksManager from "../components/content/LandmarksManager";
import SafetyTipsManager from "../components/content/SafetyTipsManager";
import JurisdictionsView from "../components/content/JurisdictionsView";

const TABS = [
  { key: "landmarks", label: "Landmarks" },
  { key: "tips", label: "Safety Tips" },
  { key: "jurisdictions", label: "Jurisdictions" },
];

function ContentPage() {
  const [tab, setTab] = useState("landmarks");

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-800">Content</h1>

      <div className="mt-4 flex gap-1 border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "landmarks" && <LandmarksManager />}
        {tab === "tips" && <SafetyTipsManager />}
        {tab === "jurisdictions" && <JurisdictionsView />}
      </div>
    </div>
  );
}

export default ContentPage;