import { useState } from "react";
import TopBar from "../components/layout/TopBar";
import ScraperStatusCard from "../components/scraper/ScraperStatusCard";
import ScraperHealthTable from "../components/scraper/ScraperHealthTable";
import AddProductModal from "../components/products/AddProductModal";
import {
  useHealthStats,
  useSelfHealingTimeline,
  useProducts,
} from "../hooks/useProducts";
import {
  Activity,
  AlertCircle,
  Wrench,
  ShieldCheck,
} from "lucide-react";

export default function ScraperHealth() {
  const { stats, collectors } = useHealthStats();
  const { data: timeline } = useSelfHealingTimeline();
  const { addProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTimelineIcon = (type) => {
    switch (type) {
      case "detection":
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      case "failure":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      case "healing":
        return <Wrench className="w-3.5 h-3.5 text-accent-teal" />;
      case "recovery":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <TopBar
        title="Scraper Health"
        subtitle="Monitor collector reliability and self-healing activity."
        onRefresh={() => window.location.reload()}
        onAddProduct={() => setIsModalOpen(true)}
      />

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScraperStatusCard
          title="Collectors"
          value={stats.totalCollectors}
          subtitle="Active extraction tasks"
        />
        <ScraperStatusCard
          title="Healthy"
          value={stats.healthy}
          status="healthy"
          subtitle="Operating normally"
        />
        <ScraperStatusCard
          title="Recovering"
          value={stats.recovering}
          status="recovering"
          subtitle="Self-healing in progress"
        />
        <ScraperStatusCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          status="operational"
          subtitle="Target 99.0% SLA"
        />
      </div>

      {/* Main Table Section */}
      <ScraperHealthTable collectors={collectors} />

      {/* Observability Self-Healing Timeline */}
      <div className="card bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Self-Healing Log & Diagnostics
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Real-time sequence of DOM drift detection, extraction repair, and validation
            </p>
          </div>
        </div>

        <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          {timeline.map((item) => (
            <div key={item.id} className="relative flex items-start gap-4">
              {/* Dot */}
              <div className="relative z-10 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center flex-shrink-0 -ml-[23px] shadow-2xs">
                {getTimelineIcon(item.type)}
              </div>

              {/* Content Box */}
              <div className="flex-1 bg-slate-50/70 border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-text-muted">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 font-mono">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={addProduct}
      />
    </div>
  );
}
