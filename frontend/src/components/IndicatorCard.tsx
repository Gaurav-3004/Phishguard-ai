import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import type { Indicator } from "../types";

const SEVERITY_CONFIG = {
  high: { icon: AlertTriangle, color: "text-alert", bg: "bg-alert/10", border: "border-alert/20" },
  medium: { icon: AlertCircle, color: "text-caution", bg: "bg-caution/10", border: "border-caution/20" },
  low: { icon: Info, color: "text-mist-muted", bg: "bg-white/5", border: "border-white/10" },
};

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const cfg = SEVERITY_CONFIG[indicator.severity] ?? SEVERITY_CONFIG.low;
  const Icon = cfg.icon;
  return (
    <div className={`glass-card glass-card-hover flex gap-3 p-4 ${cfg.border}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
      <div>
        <p className="text-sm font-medium text-mist">{indicator.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-mist-muted">{indicator.explanation}</p>
      </div>
    </div>
  );
}

export function PositiveIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-safe/20 bg-safe/[0.06] px-4 py-3">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" />
      <span className="text-sm text-mist">{text}</span>
    </div>
  );
}
