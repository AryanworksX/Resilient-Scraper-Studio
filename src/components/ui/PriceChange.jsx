import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { calcPriceChange, cn } from "../../lib/utils";

export default function PriceChange({ current, previous }) {
  const { value, direction } = calcPriceChange(current, previous);

  if (direction === "flat") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
        <Minus className="w-3 h-3" />
        <span>0%</span>
      </span>
    );
  }

  const isDown = direction === "down";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold",
        isDown ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
      )}
    >
      {isDown ? (
        <TrendingDown className="w-3.5 h-3.5" />
      ) : (
        <TrendingUp className="w-3.5 h-3.5" />
      )}
      <span>{value}%</span>
    </span>
  );
}
