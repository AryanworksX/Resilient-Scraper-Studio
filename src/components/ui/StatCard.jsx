import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, accentColor = "text-accent-teal" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-interactive cursor-default bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </p>
        {Icon && (
          <div className="p-2 rounded-xl bg-accent-teal-light text-accent-teal border border-accent-teal-border/30">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <p className="text-3xl font-bold text-text-primary tracking-tight">
        {value}
      </p>

      {subtitle && (
        <div className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-text-muted">
          <span>{subtitle}</span>
        </div>
      )}
    </motion.div>
  );
}
