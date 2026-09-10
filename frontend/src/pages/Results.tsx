import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FileSearch, RotateCcw, Save, Share2, Sparkles } from "lucide-react";
import RiskScoreGauge from "../components/RiskScoreGauge";
import ThreatBadge from "../components/ThreatBadge";
import { IndicatorCard, PositiveIndicator } from "../components/IndicatorCard";
import EmptyState from "../components/EmptyState";
import { buildSecurityBreakdown } from "../utils/securityBreakdown";
import { useToast } from "../components/Toast";
import type { AnalysisResult } from "../types";

const BAR_COLOR: Record<string, string> = {
  SAFE: "#3DDC97",
  "LOW RISK": "#FFB454",
  SUSPICIOUS: "#FFB454",
  "HIGH RISK": "#FF5D73",
};

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { show } = useToast();
  const result = location.state as AnalysisResult | null;

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <EmptyState
          icon={FileSearch}
          title="No report to show"
          description="Run an analysis first to see a full threat report here."
          actionLabel="Analyze content"
          actionTo="/analyze"
        />
      </div>
    );
  }

  const isSafe = result.classification === "SAFE";
  const breakdown = buildSecurityBreakdown(result.indicators, result.risk_score);
  const barColor = BAR_COLOR[result.classification];

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
      <div className="text-center">
        <span className="label-tag">THREAT ANALYSIS COMPLETE</span>
        <div className="mt-6 flex justify-center">
          <RiskScoreGauge score={result.risk_score} classification={result.classification} />
        </div>
        <div className="mt-4 flex justify-center">
          <ThreatBadge classification={result.classification} size="lg" />
        </div>
        {!result.ai_used && result.ai_note && (
          <p className="mt-3 text-xs text-mist-faint">{result.ai_note}</p>
        )}
      </div>

      <section className="glass-card mt-10 p-6">
        <h2 className="label-tag">THREAT SUMMARY</h2>
        <p className="mt-2 text-base leading-relaxed text-mist">{result.summary}</p>
      </section>

      <section className="mt-10">
        <h2 className="label-tag mb-4">{isSafe ? "POSITIVE INDICATORS" : "DETECTED INDICATORS"}</h2>
        {isSafe || result.indicators.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {result.positive_indicators.map((p, i) => (
              <PositiveIndicator key={i} text={p} />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {result.indicators.map((ind) => (
              <IndicatorCard key={ind.id} indicator={ind} />
            ))}
          </div>
        )}
      </section>

      {!isSafe && (
        <section className="glass-card mt-10 p-6">
          <h2 className="label-tag mb-4">SECURITY BREAKDOWN</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={breakdown} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="category"
                width={130}
                tick={{ fill: "#7C8A9E", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ background: "#111826", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, "Risk"]}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
                {breakdown.map((_, i) => (
                  <Cell key={i} fill={barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      <section className="glass-card mt-10 p-6">
        <h2 className="label-tag mb-4">RECOMMENDED ACTION</h2>
        <ol className="flex flex-col gap-3">
          {result.recommended_actions.map((action, i) => (
            <li key={i} className="flex gap-3 text-sm text-mist">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal/15 font-mono text-[11px] text-signal">
                {i + 1}
              </span>
              {action}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => navigate("/analyze")} className="btn-primary">
          <RotateCcw className="h-4 w-4" /> Scan Another
        </button>
        <button
          onClick={() => show("Report saved to History.", "success")}
          className="btn-secondary"
        >
          <Save className="h-4 w-4" /> Save Report
        </button>
        <button
          onClick={() => {
            const text = `PhishGuard AI scan: ${result.classification} (${result.risk_score}/100) — ${result.summary}`;
            if (navigator.share) {
              navigator.share({ text }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(text);
              show("Result copied to clipboard.", "success");
            }
          }}
          className="btn-secondary"
        >
          <Share2 className="h-4 w-4" /> Share Result
        </button>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-mist-faint">
        <Sparkles className="h-3.5 w-3.5" />
        This report has automatically been added to your <Link to="/history" className="underline hover:text-mist-muted">History</Link>.
      </p>
    </div>
  );
}
