import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { calcPriceChange } from "../../lib/utils";

export default function Sparkline({ data, width = 80, height = 32 }) {
  // Determine trend color
  const color = useMemo(() => {
    if (!data || data.length < 2) return "#64748B";
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (last < first) return "#F43F5E"; // rose — price went down
    if (last > first) return "#10B981"; // green — price went up
    return "#64748B"; // muted — flat
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
