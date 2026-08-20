import StatusBadge from "../ui/StatusBadge";
import { CheckCircle2, RefreshCw } from "lucide-react";

export default function ScraperHealthTable({ collectors }) {
  return (
    <div className="card overflow-hidden p-0 bg-white">
      <div className="px-6 py-4 border-b border-border bg-slate-50/50">
        <h3 className="text-base font-bold text-text-primary">
          Collector Status
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-text-muted uppercase tracking-wider font-semibold border-b border-border">
            <tr>
              <th className="py-3.5 px-6">Product</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Last Run</th>
              <th className="py-3.5 px-6">Extraction</th>
              <th className="py-3.5 px-6">Self-Heal</th>
              <th className="py-3.5 px-6 text-right">Success Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {collectors.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-4 px-6">
                  <div>
                    <p className="font-bold text-text-primary text-sm">
                      {c.product}
                    </p>
                    <p className="text-xs text-text-muted">{c.domain}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={c.status} />
                </td>
                <td className="py-4 px-6 text-text-secondary font-medium">{c.lastRun}</td>
                <td className="py-4 px-6">
                  {c.extraction === "successful" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Successful
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Repairing
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {c.selfHeal === "recovered" && (
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-[11px]">
                      Recovered
                    </span>
                  )}
                  {c.selfHeal === "in_progress" && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px]">
                      In progress
                    </span>
                  )}
                  {!c.selfHeal && <span className="text-text-muted">—</span>}
                </td>
                <td className="py-4 px-6 text-right font-bold text-text-primary text-sm">
                  {c.successRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
