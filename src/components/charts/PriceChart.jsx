import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../lib/utils";

const timeFilters = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900 text-white border border-slate-800 rounded-xl px-3.5 py-2.5 shadow-xl">
      <p className="text-[11px] text-slate-400 font-medium mb-1">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-teal-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-accent-teal" />
            Current Price:
          </span>
          <span className="font-bold text-white">
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PriceChart({ data, title = "Price Activity" }) {
  const [activeFilter, setActiveFilter] = useState(30);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.slice(-activeFilter);
  }, [data, activeFilter]);

  return (
    <div className="card bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Tracked price fluctuations over time across collectors
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {timeFilters.map((f) => (
            <button
              key={f.days}
              onClick={() => setActiveFilter(f.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${
                  activeFilter === f.days
                    ? "bg-accent-teal text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[290px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A7363" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#1A7363" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
              }}
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              width={50}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#1A7363"
              strokeWidth={2.5}
              fill="url(#tealGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#1A7363",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
