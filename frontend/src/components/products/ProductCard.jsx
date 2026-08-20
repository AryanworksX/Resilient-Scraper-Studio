import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Clock } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import PriceChange from "../ui/PriceChange";
import StockBadge from "../ui/StockBadge";
import Sparkline from "../charts/Sparkline";

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();

  // Consistent accent badges
  const categoryStyles = {
    Footwear: "bg-orange-50 text-orange-700 border-orange-200",
    Electronics: "bg-blue-50 text-blue-700 border-blue-200",
    Accessories: "bg-violet-50 text-violet-700 border-violet-200",
    Other: "bg-teal-50 text-teal-700 border-teal-200",
  };

  const catStyle = categoryStyles[product.category] || categoryStyles.Other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/products/${product.id}`)}
      className="card card-interactive bg-white cursor-pointer group"
      id={`product-card-${product.id}`}
    >
      <div className="flex items-center gap-4">
        {/* Product Initial Icon Badge */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border font-bold text-lg ${catStyle}`}
        >
          {product.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-accent-teal transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-text-muted truncate">
              <Globe className="w-3 h-3 flex-shrink-0" />
              {product.domain}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {product.lastScraped}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="hidden sm:block flex-shrink-0">
          <Sparkline data={product.sparkline} />
        </div>

        {/* Price & Stock */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text-primary">
              {formatCurrency(product.price)}
            </span>
            <PriceChange current={product.price} previous={product.previousPrice} />
          </div>
          <StockBadge status={product.stock} />
        </div>
      </div>
    </motion.div>
  );
}
