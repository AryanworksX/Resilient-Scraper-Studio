import { cn } from "../../lib/utils";

export default function StockBadge({ status }) {
  const map = {
    in_stock: {
      label: "In Stock",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      dotColor: "bg-emerald-500",
    },
    out_of_stock: {
      label: "Out of Stock",
      color: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      dotColor: "bg-rose-500",
    },
    restocked: {
      label: "Restocked",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      dotColor: "bg-amber-500",
    },
  };

  const config = map[status] || map.in_stock;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.bgColor,
        config.color,
        config.borderColor
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
