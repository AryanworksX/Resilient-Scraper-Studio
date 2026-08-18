import { TrendingDown, RefreshCw, Cpu, ShieldCheck } from "lucide-react";

export default function ActivityTimeline({ events }) {
  const getConfig = (type) => {
    switch (type) {
      case "price_drop":
        return {
          title: "Price Drop",
          color: "text-rose-700",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          icon: <TrendingDown className="w-3.5 h-3.5 text-rose-600" />,
        };
      case "restock":
        return {
          title: "Restock",
          color: "text-amber-700",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600" />,
        };
      case "self_heal":
        return {
          title: "Self-Heal",
          color: "text-teal-700",
          bgColor: "bg-teal-50",
          borderColor: "border-teal-200",
          icon: <Cpu className="w-3.5 h-3.5 text-teal-600" />,
        };
      default:
        return {
          title: "Health Check",
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
        };
    }
  };

  return (
    <div className="card bg-white">
      <h3 className="text-base font-bold text-text-primary mb-4">
        Recent Activity
      </h3>

      <div className="relative pl-3 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        {events.map((event) => {
          const config = getConfig(event.type);
          return (
            <div key={event.id} className="relative flex items-start gap-3.5 group">
              {/* Dot Icon */}
              <div
                className={`relative z-10 w-6 h-6 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0 shadow-2xs`}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${config.color}`}
                  >
                    {config.title}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {event.timeAgo}
                  </span>
                </div>

                {event.product && (
                  <p className="text-xs font-bold text-text-primary mt-0.5 truncate">
                    {event.product}
                  </p>
                )}

                <p className="text-xs text-text-secondary mt-0.5">{event.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
