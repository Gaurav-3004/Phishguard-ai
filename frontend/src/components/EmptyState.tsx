import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Icon className="h-9 w-9 text-mist-faint" />
      <p className="font-display text-lg font-medium text-mist">{title}</p>
      <p className="max-w-sm text-sm text-mist-muted">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
