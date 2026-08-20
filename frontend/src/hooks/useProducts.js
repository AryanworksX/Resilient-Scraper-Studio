// ============================================================
// DATA HOOKS — mock data, except useProducts() which is now wired
// to the real Flask + Supabase backend (GET /api/items).
// ============================================================
// NOTE: the backend's `items` table only stores
// { id, title, price, stock, scraped_at } — it has no concept of
// domain/category/url/sparkline history yet. Those fields are
// filled with sane placeholders below so the existing UI components
// don't break. Extend backend/schema.sql + db.py if you want them
// to be real for the demo.
// ============================================================

import { useState, useEffect, useMemo } from "react";
import {
  products as mockProducts,
  priceHistory as mockPriceHistory,
  stockHistory as mockStockHistory,
  scraperEvents as mockScraperEvents,
  activityFeed as mockActivityFeed,
  healthStats as mockHealthStats,
  collectors as mockCollectors,
  selfHealingTimeline as mockSelfHealingTimeline,
  dashboardStats as mockDashboardStats,
  aggregatedPriceActivity as mockAggregatedPriceActivity,
  productDetailStats as mockProductDetailStats,
} from "../data/mockData";

// Set VITE_API_URL in frontend/.env(.local) — see frontend/.env.example
const API_URL = import.meta.env.VITE_API_URL || "";

function stockLabel(raw) {
  if (!raw) return "in_stock";
  const s = raw.toLowerCase();
  if (s.includes("out")) return "out_of_stock";
  return "in_stock";
}

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso || "unknown";
  const diffMin = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)} d ago`;
}

// Backend row -> shape the existing UI components expect
function toProduct(row) {
  return {
    id: String(row.id),
    name: row.title,
    domain: null,
    image: null,
    price: row.price,
    previousPrice: row.price,
    currency: "₹",
    stock: stockLabel(row.stock),
    lastScraped: timeAgo(row.scraped_at),
    lastScrapedAt: row.scraped_at,
    sparkline: [],
    category: "Uncategorized",
    url: null,
  };
}

/**
 * Get all tracked products — fetches real data from the Flask/Supabase
 * backend. Falls back to mock data if the API isn't reachable, so the
 * demo UI never shows a blank/broken screen (e.g. if env vars aren't
 * set yet, or Supabase is briefly unavailable).
 */
export function useProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(true);
  const [usingLiveData, setUsingLiveData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/items`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        const live = (json.items || []).map(toProduct);
        if (!cancelled) {
          setProducts(live.length ? live : mockProducts);
          setUsingLiveData(true);
        }
      } catch (err) {
        console.warn("Falling back to mock product data:", err.message);
        if (!cancelled) {
          setProducts(mockProducts);
          setUsingLiveData(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addProduct = (url) => {
    // The backend has no "scrape this URL now" endpoint yet — /api/scrape
    // expects an already-scraped item (that's what your scraper script
    // posts). So "adding a product" from the UI is still a local mock
    // until that endpoint exists.
    const newProduct = {
      id: `product-${Date.now()}`,
      name: new URL(url).hostname.replace("www.", "") + " Product",
      domain: new URL(url).hostname.replace("www.", ""),
      image: null,
      price: Math.floor(Math.random() * 20000) + 2000,
      previousPrice: Math.floor(Math.random() * 25000) + 3000,
      currency: "₹",
      stock: "in_stock",
      lastScraped: "Just now",
      lastScrapedAt: new Date().toISOString(),
      sparkline: Array.from({ length: 20 }, () => ({
        value: Math.floor(Math.random() * 80) + 10,
      })),
      category: "Other",
      url,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  return { products, addProduct, loading, usingLiveData };
}

/**
 * Get a single product by ID
 */
export function useProduct(id) {
  const { products } = useProducts();
  const product = useMemo(
    () => products.find((p) => p.id === id) || null,
    [products, id]
  );
  return { product };
}

/**
 * Get price history for a product
 */
export function usePriceHistory(productId) {
  const data = mockPriceHistory[productId] || [];
  return { data };
}

/**
 * Get stock history for a product
 */
export function useStockHistory(productId) {
  const data = mockStockHistory[productId] || [];
  return { data };
}

/**
 * Get scraper events for a product
 */
export function useScraperEvents(productId) {
  const data = mockScraperEvents[productId] || [];
  return { data };
}

/**
 * Get global activity feed
 */
export function useActivityFeed() {
  return { data: mockActivityFeed };
}

/**
 * Get scraper health stats
 */
export function useHealthStats() {
  return {
    stats: mockHealthStats,
    collectors: mockCollectors,
  };
}

/**
 * Get self-healing timeline
 */
export function useSelfHealingTimeline() {
  return { data: mockSelfHealingTimeline };
}

/**
 * Get dashboard stats
 */
export function useDashboardStats() {
  return { stats: mockDashboardStats };
}

/**
 * Get aggregated price activity for dashboard chart
 */
export function useAggregatedPriceActivity() {
  return { data: mockAggregatedPriceActivity };
}

/**
 * Get detail stats for a product (lowest, highest, average)
 */
export function useProductDetailStats(productId) {
  const stats = mockProductDetailStats[productId] || {
    lowestPrice: 0,
    highestPrice: 0,
    averagePrice: 0,
  };
  return { stats };
}
