'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface GrowthPoint {
  month: string;
  count: number;
}

export default function CatalogGrowth({ data }: { data: GrowthPoint[] }) {
  // Compute cumulative
  let cumulative = 0;
  const chartData = data.map((d) => {
    cumulative += d.count;
    return { month: d.month, added: d.count, total: cumulative };
  });

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-4">📈 Catalog Growth</h2>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
            <XAxis
              dataKey="month"
              stroke="#8b90a5"
              fontSize={11}
              tickFormatter={(v) => {
                const [y, m] = v.split('-');
                return `${m}/${y.slice(2)}`;
              }}
            />
            <YAxis stroke="#8b90a5" fontSize={12} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip
              contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
              labelStyle={{ color: '#e4e6f0' }}
              itemStyle={{ color: '#e4e6f0' }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'total' ? 'Cumulative' : 'Added',
              ]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              fill="url(#growthGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
