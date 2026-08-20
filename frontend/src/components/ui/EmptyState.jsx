import { PackageOpen } from "lucide-react";

export default function EmptyState({ title = "No data yet", message = "Start tracking products to see data here.", action, actionLabel = "Add Product" }) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-xs">{message}</p>
      {action && (
        <button
          onClick={action}
          className="mt-5 px-4 py-2 rounded-[var(--radius-button)] bg-accent-cyan text-bg-primary text-sm font-semibold
            hover:brightness-110 transition-all duration-200 active:scale-[0.97]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
