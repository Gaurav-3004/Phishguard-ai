import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-signal",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <span className="label-tag">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-mist">{value}</p>
    </div>
  );
}
