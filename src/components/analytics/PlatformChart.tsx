'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { platform: string; count: number }[];
}

const COLORS = [
  '#6366f1', '#22c55e', '#f97316', '#06b6d4', '#a855f7',
  '#ec4899', '#eab308', '#ef4444', '#14b8a6', '#8b5cf6',
  '#f43f5e', '#84cc16',
];

export default function PlatformChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  // Group smaller platforms into "Other"
  const TOP_N = 8;
  const top = data.slice(0, TOP_N);
  const otherCount = data.slice(TOP_N).reduce((s, d) => s + d.count, 0);
  const chartData = [
    ...top.map(d => ({
      name: d.platform,
      value: d.count,
      pct: ((d.count / total) * 100).toFixed(1),
    })),
    ...(otherCount > 0
      ? [{ name: 'Other', value: otherCount, pct: ((otherCount / total) * 100).toFixed(1) }]
      : []),
  ];

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-1">📱 Downloads by Platform</h2>
      <p className="text-[#8b90a5] text-sm mb-4">Listening app distribution</p>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="h-[280px] w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, pct }) => `${name} ${pct}%`}
                labelLine={false}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
                formatter={(value: number, name: string) => [value.toLocaleString(), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {chartData.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="truncate">{d.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8b90a5] text-xs">{d.pct}%</span>
                <span className="font-mono text-xs" style={{ color: COLORS[i % COLORS.length] }}>
                  {d.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
