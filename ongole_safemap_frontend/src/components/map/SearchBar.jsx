function resultIcon(result) {
    if (result.kind === "zone") return "📍";
    if (result.type === "police_station") return "👮";
    if (result.type === "hospital") return "🏥";
    if (result.type === "help_desk") return "ℹ️";
    return "📍";
}

function resultSubtitle(result) {
    if (result.kind === "zone") {
        return result.crime_score?.risk_label
            ? `Zone · ${result.crime_score.risk_label}`
            : "Zone";
    }
    if (result.type === "police_station") return "Police Station";
    if (result.type === "hospital") return "Hospital";
    if (result.type === "help_desk") return "Help Desk";
    return "Landmark";
}

function SearchBar({ value, onChange, results, onSelectResult, showResults }) {
    return (
        <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-2rem)] max-w-sm">
            <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-3 gap-3 transition-shadow hover:shadow-xl">
                <svg
                    className="w-5 h-5 text-zinc-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search zones, police stations, hospitals..."
                    className="flex-1 outline-none text-sm text-zinc-800 placeholder:text-zinc-400 bg-transparent"
                />
                {value && (
                    <button
                        onClick={() => onChange("")}
                        className="text-zinc-400 hover:text-zinc-600 active:scale-90 transition-transform flex-shrink-0"
                        aria-label="Clear search"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {showResults && value.trim() && (
                <div className="mt-2 bg-white rounded-xl shadow-lg max-h-72 overflow-y-auto">
                    {results.length === 0 ? (
                        <p className="text-sm text-zinc-400 px-4 py-3">No matches found.</p>
                    ) : (
                        results.map((result) => (
                            <button
                                key={`${result.kind}-${result.id}`}
                                onClick={() => onSelectResult(result)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 text-left border-b border-zinc-100 last:border-0"
                            >
                                <span className="text-lg flex-shrink-0">{resultIcon(result)}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-800 truncate">{result.name}</p>
                                    <p className="text-xs text-zinc-400">{resultSubtitle(result)}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;