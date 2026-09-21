import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Panel from "./Panel";
import { CHART, TOOLTIP_STYLE } from "./chartTheme";
import { formatCurrency } from "../../utils/format";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatMonth(value) {
  if (typeof value !== "string" || !value.includes("-")) return value;
  const [year, month] = value.split("-");
  return `${SHORT_MONTHS[Number(month) - 1] || month} ${year.slice(2)}`;
}

export default function RevenueChart({ data = [], months = 6 }) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Panel
      className="flex h-full flex-col"
      title="Revenue Analytics"
      subtitle={`Pendapatan ${months} bulan terakhir`}
      action={
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(total)}</p>
          <p className="text-xs text-gray-400">Total periode</p>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={280} className="flex-1">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: CHART.axis }}
            tickFormatter={formatMonth}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: CHART.axis }}
            tickFormatter={(v) => `${v / 1000000}jt`}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            labelFormatter={formatMonth}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: CHART.primaryPale }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={CHART.primary}
            strokeWidth={2.5}
            fill="url(#revenueFill)"
            dot={false}
            activeDot={{ r: 5, fill: CHART.primary, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}
