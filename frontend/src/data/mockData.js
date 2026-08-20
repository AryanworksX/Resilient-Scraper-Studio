// ============================================================
// MOCK DATA — Replace with API calls when backend is ready
// ============================================================

// Helper to generate price history data points
function generatePriceHistory(basePrice, volatility, days = 90) {
  const data = [];
  const now = new Date();
  let price = basePrice * (1 + volatility * 0.5);

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.45) * volatility * basePrice;
    price = Math.max(basePrice * 0.85, Math.min(basePrice * 1.25, price + change));
    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price),
    });
  }

  return data;
}

// Helper to generate sparkline data
function generateSparkline(trend = "down", points = 20) {
  const data = [];
  let value = 50;
  for (let i = 0; i < points; i++) {
    const direction = trend === "down" ? -0.6 : 0.6;
    value += (Math.random() + direction) * 3;
    value = Math.max(10, Math.min(90, value));
    data.push({ value: Math.round(value) });
  }
  return data;
}

// ============================================================
// PRODUCTS
// ============================================================

export const products = [
  {
    id: "nike-air-max-90",
    name: "Nike Air Max 90",
    domain: "nike.com",
    image: null, // Will be replaced with real image
    price: 9999,
    previousPrice: 10899,
    currency: "₹",
    stock: "in_stock",
    lastScraped: "2 min ago",
    lastScrapedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    sparkline: generateSparkline("down"),
    category: "Footwear",
    url: "https://nike.com/air-max-90",
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    domain: "amazon.in",
    image: null,
    price: 24990,
    previousPrice: 26100,
    currency: "₹",
    stock: "in_stock",
    lastScraped: "4 min ago",
    lastScrapedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    sparkline: generateSparkline("down"),
    category: "Electronics",
    url: "https://amazon.in/sony-wh-1000xm5",
  },
  {
    id: "apple-airpods-pro",
    name: "Apple AirPods Pro",
    domain: "apple.com/in",
    image: null,
    price: 24900,
    previousPrice: 24900,
    currency: "₹",
    stock: "out_of_stock",
    lastScraped: "1 min ago",
    lastScrapedAt: new Date(Date.now() - 1 * 60000).toISOString(),
    sparkline: generateSparkline("flat"),
    category: "Electronics",
    url: "https://apple.com/in/airpods-pro",
  },
  {
    id: "logitech-mx-master-3s",
    name: "Logitech MX Master 3S",
    domain: "flipkart.com",
    image: null,
    price: 7995,
    previousPrice: 8995,
    currency: "₹",
    stock: "restocked",
    lastScraped: "6 min ago",
    lastScrapedAt: new Date(Date.now() - 6 * 60000).toISOString(),
    sparkline: generateSparkline("down"),
    category: "Accessories",
    url: "https://flipkart.com/logitech-mx-master-3s",
  },
  {
    id: "samsung-galaxy-buds-2-pro",
    name: "Samsung Galaxy Buds2 Pro",
    domain: "samsung.com/in",
    image: null,
    price: 11999,
    previousPrice: 13999,
    currency: "₹",
    stock: "in_stock",
    lastScraped: "3 min ago",
    lastScrapedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    sparkline: generateSparkline("down"),
    category: "Electronics",
    url: "https://samsung.com/in/galaxy-buds2-pro",
  },
];

// ============================================================
// PRICE HISTORY (per product)
// ============================================================

export const priceHistory = {
  "nike-air-max-90": generatePriceHistory(10000, 0.08),
  "sony-wh-1000xm5": generatePriceHistory(25000, 0.06),
  "apple-airpods-pro": generatePriceHistory(24900, 0.04),
  "logitech-mx-master-3s": generatePriceHistory(8500, 0.1),
  "samsung-galaxy-buds-2-pro": generatePriceHistory(12500, 0.12),
};

// ============================================================
// AGGREGATED PRICE CHART (for dashboard — all products overlay)
// ============================================================

export const aggregatedPriceActivity = generatePriceHistory(15000, 0.06);

// ============================================================
// STOCK HISTORY (per product)
// ============================================================

export const stockHistory = {
  "nike-air-max-90": [
    { status: "in_stock", from: "2026-07-01", to: "2026-07-18" },
    { status: "out_of_stock", from: "2026-07-18", to: "2026-07-22" },
    { status: "in_stock", from: "2026-07-22", to: null },
  ],
  "sony-wh-1000xm5": [
    { status: "in_stock", from: "2026-06-15", to: null },
  ],
  "apple-airpods-pro": [
    { status: "in_stock", from: "2026-06-01", to: "2026-08-10" },
    { status: "out_of_stock", from: "2026-08-10", to: null },
  ],
  "logitech-mx-master-3s": [
    { status: "in_stock", from: "2026-06-01", to: "2026-07-25" },
    { status: "out_of_stock", from: "2026-07-25", to: "2026-08-18" },
    { status: "restocked", from: "2026-08-18", to: null },
  ],
  "samsung-galaxy-buds-2-pro": [
    { status: "in_stock", from: "2026-07-01", to: null },
  ],
};

// ============================================================
// SCRAPER EVENTS (per product)
// ============================================================

export const scraperEvents = {
  "nike-air-max-90": [
    {
      id: "evt-1",
      type: "collector_started",
      message: "Collector started for nike.com",
      timestamp: "2026-08-18T19:30:00Z",
    },
    {
      id: "evt-2",
      type: "extraction_success",
      message: "Price and stock extracted successfully",
      timestamp: "2026-08-18T19:30:02Z",
    },
    {
      id: "evt-3",
      type: "html_changed",
      message: "HTML structure change detected on nike.com",
      timestamp: "2026-08-18T19:35:00Z",
      severity: "warning",
    },
    {
      id: "evt-4",
      type: "extraction_failed",
      message: "Price selector stopped returning data",
      timestamp: "2026-08-18T19:35:01Z",
      severity: "error",
      detail: ".product-price__value selector returned null",
    },
    {
      id: "evt-5",
      type: "self_healing_triggered",
      message: "Self-healing initiated for price extraction",
      timestamp: "2026-08-18T19:35:02Z",
      severity: "info",
      detail: "Analyzing new DOM structure to locate price element",
    },
    {
      id: "evt-6",
      type: "collector_repaired",
      message: "Collector regenerated extraction logic",
      timestamp: "2026-08-18T19:35:05Z",
      severity: "success",
      detail: 'New selector: [data-testid="product-price"] .price-amount',
    },
    {
      id: "evt-7",
      type: "extraction_success",
      message: "Price successfully extracted again — ₹9,999",
      timestamp: "2026-08-18T19:35:06Z",
    },
  ],
  "sony-wh-1000xm5": [
    {
      id: "evt-10",
      type: "collector_started",
      message: "Collector started for amazon.in",
      timestamp: "2026-08-18T19:32:00Z",
    },
    {
      id: "evt-11",
      type: "extraction_success",
      message: "Price and stock extracted successfully",
      timestamp: "2026-08-18T19:32:03Z",
    },
  ],
  "apple-airpods-pro": [
    {
      id: "evt-20",
      type: "collector_started",
      message: "Collector started for apple.com/in",
      timestamp: "2026-08-18T19:34:00Z",
    },
    {
      id: "evt-21",
      type: "extraction_success",
      message: "Stock status extracted — Out of Stock",
      timestamp: "2026-08-18T19:34:02Z",
    },
    {
      id: "evt-22",
      type: "html_changed",
      message: "Minor DOM change detected on apple.com",
      timestamp: "2026-08-18T19:36:00Z",
      severity: "warning",
    },
    {
      id: "evt-23",
      type: "self_healing_triggered",
      message: "Self-healing initiated for stock extraction",
      timestamp: "2026-08-18T19:36:01Z",
      severity: "info",
    },
  ],
  "logitech-mx-master-3s": [
    {
      id: "evt-30",
      type: "collector_started",
      message: "Collector started for flipkart.com",
      timestamp: "2026-08-18T19:28:00Z",
    },
    {
      id: "evt-31",
      type: "extraction_success",
      message: "Price and stock extracted successfully",
      timestamp: "2026-08-18T19:28:02Z",
    },
  ],
  "samsung-galaxy-buds-2-pro": [
    {
      id: "evt-40",
      type: "collector_started",
      message: "Collector started for samsung.com/in",
      timestamp: "2026-08-18T19:33:00Z",
    },
    {
      id: "evt-41",
      type: "extraction_success",
      message: "Price and stock extracted successfully",
      timestamp: "2026-08-18T19:33:01Z",
    },
  ],
};

// ============================================================
// ACTIVITY FEED (global — for dashboard sidebar)
// ============================================================

export const activityFeed = [
  {
    id: "act-1",
    type: "price_drop",
    title: "Price Drop",
    product: "Nike Air Max 90",
    detail: "₹10,899 → ₹9,999",
    timeAgo: "8 min ago",
    timestamp: "2026-08-18T19:34:00Z",
  },
  {
    id: "act-2",
    type: "restock",
    title: "Restock",
    product: "Logitech MX Master 3S",
    detail: "Out of stock → In stock",
    timeAgo: "21 min ago",
    timestamp: "2026-08-18T19:21:00Z",
  },
  {
    id: "act-3",
    type: "self_heal",
    title: "Self-Heal",
    product: "Nike Air Max 90",
    detail: "Collector repaired extraction logic",
    timeAgo: "42 min ago",
    timestamp: "2026-08-18T19:00:00Z",
  },
  {
    id: "act-4",
    type: "health",
    title: "Scraper Health",
    product: null,
    detail: "All collectors operational",
    timeAgo: "1 hr ago",
    timestamp: "2026-08-18T18:42:00Z",
  },
  {
    id: "act-5",
    type: "price_drop",
    title: "Price Drop",
    product: "Samsung Galaxy Buds2 Pro",
    detail: "₹13,999 → ₹11,999",
    timeAgo: "2 hr ago",
    timestamp: "2026-08-18T17:42:00Z",
  },
  {
    id: "act-6",
    type: "price_drop",
    title: "Price Drop",
    product: "Sony WH-1000XM5",
    detail: "₹26,100 → ₹24,990",
    timeAgo: "5 hr ago",
    timestamp: "2026-08-18T14:42:00Z",
  },
];

// ============================================================
// HEALTH STATS
// ============================================================

export const healthStats = {
  totalCollectors: 5,
  healthy: 4,
  recovering: 1,
  failed: 0,
  successRate: 98.7,
};

export const collectors = [
  {
    id: "nike-air-max-90",
    product: "Nike Air Max 90",
    domain: "nike.com",
    status: "healthy",
    lastRun: "2 min ago",
    extraction: "successful",
    selfHeal: "recovered",
    successRate: 99.2,
  },
  {
    id: "sony-wh-1000xm5",
    product: "Sony WH-1000XM5",
    domain: "amazon.in",
    status: "healthy",
    lastRun: "4 min ago",
    extraction: "successful",
    selfHeal: null,
    successRate: 100,
  },
  {
    id: "apple-airpods-pro",
    product: "Apple AirPods Pro",
    domain: "apple.com/in",
    status: "recovering",
    lastRun: "1 min ago",
    extraction: "repairing",
    selfHeal: "in_progress",
    successRate: 96.4,
  },
  {
    id: "logitech-mx-master-3s",
    product: "Logitech MX Master 3S",
    domain: "flipkart.com",
    status: "healthy",
    lastRun: "6 min ago",
    extraction: "successful",
    selfHeal: null,
    successRate: 99.8,
  },
  {
    id: "samsung-galaxy-buds-2-pro",
    product: "Samsung Galaxy Buds2 Pro",
    domain: "samsung.com/in",
    status: "healthy",
    lastRun: "3 min ago",
    extraction: "successful",
    selfHeal: null,
    successRate: 100,
  },
];

// ============================================================
// SELF-HEALING TIMELINE (detailed — for scraper health page)
// ============================================================

export const selfHealingTimeline = [
  {
    id: "sh-1",
    time: "10:42",
    type: "detection",
    title: "DOM change detected",
    detail: "nike.com product page structure modified",
    severity: "warning",
  },
  {
    id: "sh-2",
    time: "10:42",
    type: "failure",
    title: "Extraction returned empty price",
    detail: ".product-price__value selector returned null",
    severity: "error",
  },
  {
    id: "sh-3",
    time: "10:43",
    type: "healing",
    title: "Self-healing initiated",
    detail: "Analyzing new DOM structure with AI extraction engine",
    severity: "info",
  },
  {
    id: "sh-4",
    time: "10:43",
    type: "healing",
    title: "New extraction logic generated",
    detail: 'Mapped price to [data-testid="product-price"] .price-amount',
    severity: "info",
  },
  {
    id: "sh-5",
    time: "10:43",
    type: "recovery",
    title: "Price extraction recovered",
    detail: "Successfully extracted ₹9,999 with new selector",
    severity: "success",
  },
  {
    id: "sh-6",
    time: "10:44",
    type: "recovery",
    title: "Collector marked healthy",
    detail: "All extraction targets returning valid data",
    severity: "success",
  },
];

// ============================================================
// DASHBOARD STATS
// ============================================================

export const dashboardStats = {
  trackedProducts: { value: 5, change: "+2 this week" },
  priceDrops: { value: 3, change: "Last 24 hours" },
  restocks: { value: 2, change: "Last 24 hours" },
  scraperHealth: { value: "98.7%", status: "Operational" },
};

// ============================================================
// PRODUCT DETAIL STATS (per product)
// ============================================================

export const productDetailStats = {
  "nike-air-max-90": {
    lowestPrice: 8499,
    highestPrice: 12499,
    averagePrice: 10299,
  },
  "sony-wh-1000xm5": {
    lowestPrice: 22990,
    highestPrice: 29990,
    averagePrice: 25890,
  },
  "apple-airpods-pro": {
    lowestPrice: 20900,
    highestPrice: 26900,
    averagePrice: 24200,
  },
  "logitech-mx-master-3s": {
    lowestPrice: 6495,
    highestPrice: 10995,
    averagePrice: 8495,
  },
  "samsung-galaxy-buds-2-pro": {
    lowestPrice: 9999,
    highestPrice: 17999,
    averagePrice: 13499,
  },
};
