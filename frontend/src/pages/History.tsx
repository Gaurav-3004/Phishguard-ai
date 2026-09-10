import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, History as HistoryIcon, Eye } from "lucide-react";
import { api, ApiError } from "../services/api";
import ThreatBadge from "../components/ThreatBadge";
import EmptyState from "../components/EmptyState";
import { useToast } from "../components/Toast";
import type { HistoryItem } from "../types";

export default function History() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { show } = useToast();
  const navigate = useNavigate();

  async function load() {
    try {
      const data = await api.getHistory();
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load history.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    try {
      await api.deleteHistoryItem(id);
      setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
      show("Report deleted.", "success");
    } catch {
      show("Could not delete report.", "error");
    }
  }

  async function handleClear() {
    try {
      await api.clearHistory();
      setItems([]);
      show("History cleared.", "success");
    } catch {
      show("Could not clear history.", "error");
    }
  }

  function openReport(item: HistoryItem) {
    navigate("/results", {
      state: {
        id: item.id,
        scan_type: item.scan_type,
        risk_score: item.risk_score,
        classification: item.classification,
        summary: item.summary,
        indicators: item.indicators,
        positive_indicators: [],
        recommended_actions: item.recommended_actions,
        ai_used: item.ai_used,
        ai_note: item.ai_used ? null : "AI explanation unavailable. Showing rule-based analysis.",
        confidence: item.confidence,
      },
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-mist sm:text-3xl">History</h1>
        {items && items.length > 0 && (
          <button onClick={handleClear} className="btn-secondary !px-4 !py-2 text-xs">
            <Trash2 className="h-3.5 w-3.5" /> Clear History
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-alert">{error}</p>}

      {items === null && !error && (
        <p className="mt-8 text-sm text-mist-muted">Loading history…</p>
      )}

      {items && items.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={HistoryIcon}
            title="No scans yet"
            description="Analyze your first suspicious message to build your scan history."
            actionLabel="Analyze content"
            actionTo="/analyze"
          />
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-mist-muted">
                    {item.scan_type}
                  </span>
                  <span className="text-xs text-mist-faint">
                    {new Date(item.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-sm text-mist">{item.input_preview}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <p className="font-mono text-sm text-mist">{item.risk_score}/100</p>
                </div>
                <ThreatBadge classification={item.classification} size="sm" />
                <button
                  onClick={() => openReport(item)}
                  className="rounded-lg border border-white/10 p-2 text-mist-muted hover:border-signal/40 hover:text-signal"
                  aria-label="View report"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg border border-white/10 p-2 text-mist-muted hover:border-alert/40 hover:text-alert"
                  aria-label="Delete report"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
