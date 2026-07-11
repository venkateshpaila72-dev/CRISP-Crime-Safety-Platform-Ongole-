import { useState, useCallback } from "react";
import { askAssistant } from "../api/publicApi";

function extractErrorMessage(err) {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    // FastAPI validation errors: [{ type, loc, msg, input, ctx }, ...]
    return detail.map((d) => d.msg || "Invalid input").join(" ");
  }

  if (err?.message) {
    return err.message;
  }

  return "Sorry, the assistant is unavailable right now.";
}

export function useAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendQuestion = useCallback(async (question) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);

    try {
      const result = await askAssistant(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: result.answer,
          mentionedZones: result.mentioned_zones,
          safestZones: result.safest_zones,
        },
      ]);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: message, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, error, sendQuestion };
}