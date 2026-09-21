import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Panel from "./Panel";
import { CHART, TOOLTIP_STYLE } from "./chartTheme";

const COLORS = {
  APPROVED: CHART.primary,
  PENDING: CHART.warm,
  REJECTED: CHART.alert,
};

export default function PaymentStatusChart({ data }) {
  return (
    <Panel className="flex h-full flex-col" title="Payment Status" subtitle="Rekap verifikasi pembayaran">
      <ResponsiveContainer width="100%" height="100%" minHeight={280} className="flex-1">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barSize={44}>
          <CartesianGrid strokeDasharray="4 4" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART.axis }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART.axis }} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(76, 154, 95, 0.06)" }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status] || CHART.primaryPale} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}
