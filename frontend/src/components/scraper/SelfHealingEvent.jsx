import { motion } from "framer-motion";
import { AlertTriangle, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

export default function SelfHealingEvent() {
  const steps = [
    {
      id: 1,
      badge: "Detection",
      title: "Extraction changed",
      subtitle: '"Price selector stopped returning data"',
      detail: 'CSS selector `.product-price__value` returned null or missing DOM node on target website.',
      icon: AlertTriangle,
      borderColor: "border-amber-200",
      bgColor: "bg-amber-50/60",
      textColor: "text-amber-800",
      badgeColor: "bg-amber-100 text-amber-800",
      iconColor: "text-amber-600",
    },
    {
      id: 2,
      badge: "Self-Healing",
      title: "Self-healing triggered",
      subtitle: '"Collector regenerated extraction logic"',
      detail: 'AI agent re-parsed DOM tree, identified new candidate `[data-testid="product-price"] .price-amount`, and validated against structural schema.',
      icon: Wrench,
      borderColor: "border-accent-teal-border",
      bgColor: "bg-accent-teal-light/70",
      textColor: "text-accent-teal",
      badgeColor: "bg-accent-teal text-white",
      iconColor: "text-accent-teal",
      highlight: true,
    },
    {
      id: 3,
      badge: "Recovery",
      title: "Extraction successful",
      subtitle: '"Price successfully extracted again"',
      detail: 'Extraction verified — extracted ₹9,999 with 100% confidence score. Collector restored to healthy status.',
      icon: CheckCircle2,
      borderColor: "border-emerald-200",
      bgColor: "bg-emerald-50/60",
      textColor: "text-emerald-800",
      badgeColor: "bg-emerald-100 text-emerald-800",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="card bg-white relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2.5">
            <span>Self-Healing Sequence</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-accent-teal-light text-accent-teal border border-accent-teal-border">
              Live Demonstration
            </span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Automated recovery when target webpage HTML structure changes
          </p>
        </div>
      </div>

      {/* Stepper Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12 }}
              className={`relative rounded-2xl p-5 border ${step.borderColor} ${step.bgColor} ${
                step.highlight ? "shadow-md shadow-accent-teal/10 ring-2 ring-accent-teal/20" : ""
              } flex flex-col justify-between`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${step.badgeColor}`}
                  >
                    Step 0{step.id} · {step.badge}
                  </span>
                  <Icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-text-primary mb-1">
                  {step.title}
                </h4>

                <p className={`text-xs font-semibold ${step.textColor} mb-2.5 italic`}>
                  {step.subtitle}
                </p>

                {/* Detail */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.detail}
                </p>
              </div>

              {/* Step indicator arrow for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-border shadow-xs flex items-center justify-center text-text-muted">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
