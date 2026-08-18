import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Clock, CheckCircle, ShieldAlert } from "lucide-react";
import PriceChart from "../components/charts/PriceChart";
import StockBadge from "../components/ui/StockBadge";
import PriceChange from "../components/ui/PriceChange";
import SelfHealingEvent from "../components/scraper/SelfHealingEvent";
import {
  useProduct,
  usePriceHistory,
  useStockHistory,
  useScraperEvents,
  useProductDetailStats,
} from "../hooks/useProducts";
import { formatCurrency, formatTime } from "../lib/utils";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { product } = useProduct(id || "nike-air-max-90");
  const { data: priceData } = usePriceHistory(id || "nike-air-max-90");
  const { data: stockData } = useStockHistory(id || "nike-air-max-90");
  const { data: scraperData } = useScraperEvents(id || "nike-air-max-90");
  const { stats: detailStats } = useProductDetailStats(id || "nike-air-max-90");

  if (!product) {
    return (
      <div className="p-8 text-center text-text-muted">
        <p>Product not found.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 text-xs bg-white border border-border rounded-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        {/* Product Overview Header Card */}
        <div className="card bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-teal-light text-accent-teal border border-accent-teal-border flex items-center justify-center flex-shrink-0 font-bold text-2xl">
              {product.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {product.name}
                </h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tracking Active
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-text-muted" />
                  {product.domain}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  Scraped {product.lastScraped}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Right Panel */}
          <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border">
            <div>
              <p className="text-xs text-text-muted font-semibold mb-1">Current Price</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-text-primary">
                  {formatCurrency(product.price)}
                </span>
                <PriceChange
                  current={product.price}
                  previous={product.previousPrice}
                />
              </div>
            </div>
            <div className="h-10 w-[1px] bg-border hidden sm:block" />
            <div>
              <p className="text-xs text-text-muted font-semibold mb-1">Availability</p>
              <StockBadge status={product.stock} />
            </div>
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="space-y-4">
        <PriceChart data={priceData} title="Price History" />

        {/* Price Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-white py-4 px-5">
            <p className="text-xs text-text-muted uppercase font-semibold tracking-wider">
              Lowest Price
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {formatCurrency(detailStats.lowestPrice)}
            </p>
          </div>
          <div className="card bg-white py-4 px-5">
            <p className="text-xs text-text-muted uppercase font-semibold tracking-wider">
              Highest Price
            </p>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {formatCurrency(detailStats.highestPrice)}
            </p>
          </div>
          <div className="card bg-white py-4 px-5">
            <p className="text-xs text-text-muted uppercase font-semibold tracking-wider">
              Average Price
            </p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {formatCurrency(detailStats.averagePrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Availability History Timeline */}
      <div className="card bg-white">
        <h3 className="text-lg font-bold text-text-primary mb-4">
          Availability History
        </h3>
        <div className="flex flex-wrap gap-3">
          {stockData.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-border text-xs"
            >
              <StockBadge status={s.status} />
              <span className="text-text-muted font-medium">
                {s.from} {s.to ? `→ ${s.to}` : "→ Present"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Visual: Self Healing Event Sequence */}
      <SelfHealingEvent />

      {/* Detailed Scraper Activity Log */}
      <div className="card bg-white">
        <h3 className="text-lg font-bold text-text-primary mb-4">
          Collector Event Log
        </h3>
        <div className="space-y-3">
          {scraperData.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-border text-xs gap-2"
            >
              <div className="flex items-center gap-3">
                {evt.severity === "error" ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                ) : evt.severity === "warning" ? (
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-text-primary">{evt.message}</p>
                  {evt.detail && (
                    <p className="text-xs text-text-muted mt-0.5 font-mono">
                      {evt.detail}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-text-muted font-mono font-medium sm:text-right">
                {formatTime(evt.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
