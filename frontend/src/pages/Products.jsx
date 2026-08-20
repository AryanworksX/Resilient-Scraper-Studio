import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import StockBadge from "../components/ui/StockBadge";
import PriceChange from "../components/ui/PriceChange";
import AddProductModal from "../components/products/AddProductModal";
import { useProducts } from "../hooks/useProducts";
import { formatCurrency } from "../lib/utils";
import {
  Search,
  Filter,
  Share2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const { products, addProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Filter products by tab and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (activeTab === "in_stock" && p.stock !== "in_stock") return false;
      if (activeTab === "out_of_stock" && p.stock !== "out_of_stock") return false;
      if (activeTab === "restocked" && p.stock !== "restocked") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, activeTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <TopBar
        title="Products"
        subtitle="Manage and inspect all monitored products."
        onRefresh={() => window.location.reload()}
        onAddProduct={() => setIsModalOpen(true)}
      />

      {/* Main Datatable Card Container (Consist Style) */}
      <div className="card bg-white p-6 space-y-6">
        {/* Banner Alert Callout */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-teal-light/80 border border-accent-teal-border text-accent-teal text-xs font-semibold">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-teal animate-pulse-soft flex-shrink-0" />
          <span>This datatable shows all of your tracked products across e-commerce domains.</span>
        </div>

        {/* Tab Filters & Top Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
            {[
              { id: "all", label: "All Products", count: products.length },
              {
                id: "in_stock",
                label: "In Stock",
                count: products.filter((p) => p.stock === "in_stock").length,
              },
              {
                id: "out_of_stock",
                label: "Out of Stock",
                count: products.filter((p) => p.stock === "out_of_stock").length,
              },
              {
                id: "restocked",
                label: "Restocked",
                count: products.filter((p) => p.stock === "restocked").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? "bg-accent-teal text-white shadow-xs"
                      : "text-text-muted hover:text-text-primary hover:bg-slate-100"
                  }
                `}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-text-secondary hover:bg-slate-50 transition-colors shadow-2xs">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-text-secondary hover:bg-slate-50 transition-colors shadow-2xs">
              <Share2 className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Search Bar inside Datatable */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, domain or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/10 transition-all"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-text-muted uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredProducts.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-accent-teal focus:ring-accent-teal"
                  />
                </th>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Change</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Extraction Score</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filteredProducts.map((product, idx) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? "bg-accent-teal-light/30" : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(product.id)}
                        className="rounded border-slate-300 text-accent-teal focus:ring-accent-teal"
                      />
                    </td>
                    <td className="py-4 px-4 font-bold text-text-muted">
                      #{idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-accent-teal">
                          {product.name.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="font-bold text-text-primary text-sm hover:text-accent-teal text-left transition-colors"
                          >
                            {product.name}
                          </button>
                          <p className="text-[11px] text-text-muted">
                            ID: #{product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        {product.domain}
                        <ExternalLink className="w-3 h-3 text-text-muted" />
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-text-primary text-sm">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-4 px-4">
                      <PriceChange
                        current={product.price}
                        previous={product.previousPrice}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <StockBadge status={product.stock} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-700">
                            Score: Perfect
                          </span>
                          <span className="font-bold text-text-primary">100%</span>
                        </div>
                        <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-full" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-accent-teal hover:text-white text-text-secondary text-xs font-semibold transition-all"
                      >
                        Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
