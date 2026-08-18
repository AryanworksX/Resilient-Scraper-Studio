// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Format a number as Indian Rupee currency
 * @param {number} value - The amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = "₹") {
  if (value == null) return "—";
  return `${currency}${value.toLocaleString("en-IN")}`;
}

/**
 * Calculate percentage change between two prices
 * @param {number} current - Current price
 * @param {number} previous - Previous price
 * @returns {{ value: number, direction: 'up' | 'down' | 'flat' }}
 */
export function calcPriceChange(current, previous) {
  if (!previous || previous === current) {
    return { value: 0, direction: "flat" };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(parseFloat(change.toFixed(1))),
    direction: change < 0 ? "down" : "up",
  };
}

/**
 * Merge class names, filtering out falsy values
 * @param  {...string} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Get a greeting based on the current time of day
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Format a date string to a short readable format
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Format a timestamp to time string (HH:MM)
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
export function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Get stock status display config
 * @param {string} status - in_stock | out_of_stock | restocked
 * @returns {{ label: string, color: string, dotColor: string }}
 */
export function getStockConfig(status) {
  const map = {
    in_stock: {
      label: "In Stock",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
      dotColor: "bg-emerald-400",
    },
    out_of_stock: {
      label: "Out of Stock",
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      borderColor: "border-red-400/20",
      dotColor: "bg-red-400",
    },
    restocked: {
      label: "Restocked",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/20",
      dotColor: "bg-amber-400",
    },
  };
  return map[status] || map.in_stock;
}

/**
 * Get scraper status display config
 * @param {string} status - healthy | recovering | failed
 */
export function getScraperStatusConfig(status) {
  const map = {
    healthy: {
      label: "Healthy",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
      dotColor: "bg-emerald-400",
    },
    recovering: {
      label: "Recovering",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/20",
      dotColor: "bg-amber-400",
      animate: true,
    },
    failed: {
      label: "Failed",
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      borderColor: "border-red-400/20",
      dotColor: "bg-red-400",
    },
    operational: {
      label: "Operational",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
      dotColor: "bg-emerald-400",
    },
  };
  return map[status] || map.healthy;
}

/**
 * Get activity event type config
 * @param {string} type - price_drop | restock | self_heal | health
 */
export function getActivityConfig(type) {
  const map = {
    price_drop: {
      label: "Price Drop",
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
      borderColor: "border-rose-400/30",
      dotColor: "bg-rose-400",
    },
    restock: {
      label: "Restock",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/30",
      dotColor: "bg-amber-400",
    },
    self_heal: {
      label: "Self-Heal",
      color: "text-violet-400",
      bgColor: "bg-violet-400/10",
      borderColor: "border-violet-400/30",
      dotColor: "bg-violet-400",
    },
    health: {
      label: "Health",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/30",
      dotColor: "bg-cyan-400",
    },
  };
  return map[type] || map.health;
}
