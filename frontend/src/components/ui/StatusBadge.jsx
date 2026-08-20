import { cn, getScraperStatusConfig } from "../../lib/utils";

export default function StatusBadge({ status }) {
  const map = {
    healthy: {
      label: "Healthy",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      dotColor: "bg-emerald-500",
    },
    recovering: {
      label: "Recovering",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      dotColor: "bg-amber-500",
      animate: true,
    },
    failed: {
      label: "Failed",
      color: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      dotColor: "bg-rose-500",
    },
    operational: {
      label: "Operational",
      color: "text-teal-700",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      dotColor: "bg-teal-600",
    },
  };

  const config = map[status] || map.healthy;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.bgColor,
        config.color,
        config.borderColor
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          config.dotColor,
          config.animate && "animate-breathing"
        )}
      />
      {config.label}
    </span>
  );
}
