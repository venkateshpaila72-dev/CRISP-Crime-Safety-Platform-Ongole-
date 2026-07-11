import { useState, useRef, useEffect } from "react";
import { useAssistant } from "../../hooks/useAssistant";

function ZoneChip({ zone, onSelect }) {
  const riskColors = {
    "Insufficient Data": "bg-zinc-100 text-zinc-500",
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    "VERY HIGH": "bg-red-100 text-red-700",
  };

  return (
    <button
      onClick={() => onSelect(zone)}
      className={`text-xs px-2 py-1 rounded-full font-medium ${
        riskColors[zone.risk_label] || "bg-zinc-100 text-zinc-600"
      } hover:opacity-80 transition-opacity`}
    >
      {zone.name} · {zone.risk_label}
    </button>
  );
}

function ChatWidget({ onZoneSelect }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, sendQuestion } = useAssistant();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendQuestion(input);
    setInput("");
  };

  const handleZoneClick = (zone) => {
    if (onZoneSelect) {
      onZoneSelect({
        zone_id: zone.zone_id,
        name: zone.name,
        latitude: zone.latitude,
        longitude: zone.longitude,
        crime_score: {
          risk_label: zone.risk_label,
          total_incidents: zone.total_incidents,
        },
      });
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[1100] bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-colors"
        aria-label="Open safety assistant"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1100] w-80 max-w-[calc(100vw-2rem)] h-[28rem] max-h-[calc(100vh-6rem)] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white flex-shrink-0">
        <div>
          <p className="font-semibold text-sm">Ongole SafeMap Assistant</p>
          <p className="text-[11px] text-blue-100">Ask about safety in any area</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" aria-label="Close">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-zinc-50">
        {messages.length === 0 && (
          <p className="text-xs text-zinc-400 text-center mt-4">
            Try: "Is it safe near Gaddalagunta at night?" or "What's the safest area right now?"
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
              msg.role === "user"
                ? "bg-blue-600 text-white self-end rounded-br-sm"
                : msg.isError
                ? "bg-red-50 text-red-700 self-start rounded-bl-sm"
                : "bg-white text-zinc-800 self-start rounded-bl-sm shadow-sm"
            }`}
          >
            <p>{msg.text}</p>

            {msg.mentionedZones?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {msg.mentionedZones.map((z) => (
                  <ZoneChip key={z.zone_id} zone={z} onSelect={handleZoneClick} />
                ))}
              </div>
            )}

            {msg.safestZones?.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">
                  Currently safest areas
                </p>
                <div className="flex flex-wrap gap-1">
                  {msg.safestZones.map((z) => (
                    <ZoneChip key={z.zone_id} zone={z} onSelect={handleZoneClick} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="self-start bg-white px-3 py-2 rounded-lg shadow-sm">
            <p className="text-sm text-zinc-400">Thinking...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t border-zinc-200 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about safety..."
          className="flex-1 text-sm px-3 py-2 rounded-full bg-zinc-100 outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0"
          aria-label="Send"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7v14z" transform="rotate(90 12 12)" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatWidget;