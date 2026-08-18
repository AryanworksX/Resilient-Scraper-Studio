import { useState } from "react";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/ui/StatCard";
import PriceChart from "../components/charts/PriceChart";
import ProductTable from "../components/products/ProductTable";
import ActivityTimeline from "../components/activity/ActivityTimeline";
import AddProductModal from "../components/products/AddProductModal";
import {
  useProducts,
  useDashboardStats,
  useAggregatedPriceActivity,
  useActivityFeed,
} from "../hooks/useProducts";
import { Package, TrendingDown, RefreshCw, HeartPulse } from "lucide-react";

export default function Dashboard() {
  const { products, addProduct } = useProducts();
  const { stats } = useDashboardStats();
  const { data: priceActivity } = useAggregatedPriceActivity();
  const { data: activityEvents } = useActivityFeed();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRefresh = () => {
    // Simulated refresh feedback
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <TopBar
        onRefresh={handleRefresh}
        onAddProduct={() => setIsModalOpen(true)}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tracked Products"
          value={products.length}
          subtitle={stats.trackedProducts.change}
          icon={Package}
          accentColor="text-accent-cyan"
        />
        <StatCard
          title="Price Drops"
          value={stats.priceDrops.value}
          subtitle={stats.priceDrops.change}
          icon={TrendingDown}
          accentColor="text-rose-400"
        />
        <StatCard
          title="Restocks"
          value={stats.restocks.value}
          subtitle={stats.restocks.change}
          icon={RefreshCw}
          accentColor="text-amber-400"
        />
        <StatCard
          title="Scraper Health"
          value={stats.scraperHealth.value}
          subtitle={`Status: ${stats.scraperHealth.status}`}
          icon={HeartPulse}
          accentColor="text-emerald-400"
        />
      </div>

      {/* Price Activity Main Analytics Chart */}
      <PriceChart data={priceActivity} title="Price Activity" />

      {/* Tracked Products + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Tracked Products */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">
              Tracked Products
            </h3>
            <span className="text-xs text-text-muted font-medium">
              Showing {products.length} active monitors
            </span>
          </div>
          <ProductTable products={products} />
        </div>

        {/* Right: Recent Activity */}
        <div className="lg:col-span-1">
          <ActivityTimeline events={activityEvents} />
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
