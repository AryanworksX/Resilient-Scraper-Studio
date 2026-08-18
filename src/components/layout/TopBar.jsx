import { Search, RefreshCw, Plus, Bell, Settings } from "lucide-react";
import { getGreeting } from "../../lib/utils";

export default function TopBar({ title, subtitle, onRefresh, onAddProduct, showActions = true }) {
  const greeting = title || `${getGreeting()}, Team`;
  const sub = subtitle || "Monitor your tracked products and scraper health.";

  return (
    <header className="flex flex-col gap-6 mb-8">
      {/* Search & Top Action Bar (Consist Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search anything here..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/10 transition-all shadow-2xs"
          />
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-white border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all shadow-2xs"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            className="p-2.5 rounded-xl bg-white border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            className="p-2.5 rounded-xl bg-white border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all shadow-2xs"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs shadow-2xs">
            TM
          </div>
        </div>
      </div>

      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-text-muted mt-1">{sub}</p>
        </div>

        {showActions && (
          <div className="flex items-center gap-3">
            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-teal text-white text-sm font-semibold hover:bg-accent-teal-hover transition-all duration-200 shadow-md shadow-accent-teal/20 active:scale-[0.98]"
              id="add-product-button"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
