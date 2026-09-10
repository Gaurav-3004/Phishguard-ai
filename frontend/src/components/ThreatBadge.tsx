import type { Classification } from "../types";
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from "lucide-react";

const CONFIG: Record<
  Classification,
  { color: string; bg: string; border: string; icon: typeof ShieldCheck }
> = {
  SAFE: { color: "text-safe", bg: "bg-safe/10", border: "border-safe/30", icon: ShieldCheck },
  "LOW RISK": { color: "text-caution", bg: "bg-caution/10", border: "border-caution/30", icon: ShieldQuestion },
  SUSPICIOUS: { color: "text-caution", bg: "bg-caution/10", border: "border-caution/30", icon: ShieldAlert },
  "HIGH RISK": { color: "text-alert", bg: "bg-alert/10", border: "border-alert/30", icon: ShieldX },
};

export default function ThreatBadge({ classification, size = "md" }: { classification: Classification; size?: "sm" | "md" | "lg" }) {
  const cfg = CONFIG[classification];
  const Icon = cfg.icon;
  const sizing = size === "lg" ? "text-sm px-4 py-2" : size === "sm" ? "text-[11px] px-2 py-1" : "text-xs px-3 py-1.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide ${cfg.color} ${cfg.bg} ${cfg.border} ${sizing}`}
    >
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {classification}
    </span>
  );
}
