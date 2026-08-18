// ============================================================
// DATA HOOKS — Abstraction layer for mock → API swap
// ============================================================
// Currently returns mock data synchronously.
// Replace internals with fetch/useQuery when backend is ready.
// Component interfaces stay the same.
// ============================================================

import { useState, useMemo } from "react";
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

/**
 * Get all tracked products
 * Replace with: const { data } = useQuery("/api/products")
 */
export function useProducts() {
  const [products, setProducts] = useState(mockProducts);

  const addProduct = (url) => {
    // Mock: simulate adding a product
    // Replace with: await fetch("/api/products", { method: "POST", body: { url } })
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

  return { products, addProduct };
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
