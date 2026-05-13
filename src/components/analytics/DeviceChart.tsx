'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { category: string; count: number }[];
}

const COLORS: Record<string, string> = {
  'iOS/macOS': '#6366f1',
  'Android': '#22c55e',
  'Windows': '#06b6d4',
  'Linux': '#f97316',
  'Smart Speaker': '#a855f7',
  'Other': '#8b90a5',
};

const ICONS: Record<string, string> = {
  'iOS/macOS': '🍎',
  'Android': '🤖',
  'Windows': '🪟',
  'Linux': '🐧',
  'Smart Speaker': '🔊',
  'Other': '❓',
};

export default function DeviceChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const chartData = data.map(d => ({
    name: d.category,
    value: d.count,
    pct: ((d.count / total) * 100).toFixed(1),
  }));

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-1">💻 Downloads by Device</h2>
      <p className="text-[#8b90a5] text-sm mb-4">Operating system distribution</p>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="h-[250px] w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || '#8b90a5'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
                formatter={(value: number, name: string) => [value.toLocaleString(), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3 w-full">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{ICONS[d.name] || '❓'}</span>
                <span className="text-sm">{d.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-[#2a2f45] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${parseFloat(d.pct)}%`,
                      backgroundColor: COLORS[d.name] || '#8b90a5',
                    }}
                  />
                </div>
                <span className="text-sm font-mono min-w-[60px] text-right" style={{ color: COLORS[d.name] || '#8b90a5' }}>
                  {d.pct}%
                </span>
                <span className="text-xs text-[#8b90a5] min-w-[50px] text-right">
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
