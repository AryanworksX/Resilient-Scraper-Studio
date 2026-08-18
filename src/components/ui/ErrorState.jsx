import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-400/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Error</h3>
      <p className="text-sm text-text-muted max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 px-4 py-2 rounded-[var(--radius-button)] border border-border
            text-sm text-text-secondary hover:text-text-primary hover:border-border-hover
            hover:bg-bg-card-hover transition-all duration-200 active:scale-[0.97]"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
