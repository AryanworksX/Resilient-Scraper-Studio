import StatusBadge from "../ui/StatusBadge";

export default function ScraperStatusCard({ title, value, status, subtitle }) {
  return (
    <div className="card bg-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </p>
        {status && <StatusBadge status={status} />}
      </div>
      <p className="text-3xl font-bold text-text-primary tracking-tight">
        {value}
      </p>
      {subtitle && <p className="text-xs text-text-muted mt-2">{subtitle}</p>}
    </div>
  );
}
