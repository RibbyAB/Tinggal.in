import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Panel from "./Panel";
import { CHART, TOOLTIP_STYLE } from "./chartTheme";

const COLORS = {
  Occupied: CHART.primary,
  Available: CHART.primaryLight,
  Maintenance: CHART.warm,
};

export default function OccupancyChart({ occupied, available, maintenance }) {
  const data = [
    { name: "Occupied", value: occupied },
    { name: "Available", value: available },
    { name: "Maintenance", value: maintenance },
  ];

  const total = occupied + available + maintenance;

  return (
    <Panel className="h-full" title="Room Occupancy" subtitle="Distribusi status kamar">
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400">Total kamar</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[entry.name] }} />
              {entry.name}
            </span>
            <span className="font-medium text-gray-900">
              {entry.value}
              <span className="ml-1 text-xs font-normal text-gray-400">
                {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : "0%"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
