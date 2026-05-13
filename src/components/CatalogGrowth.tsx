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
  let cumulative = 0;
  const chartData = data.map((d) => {
    cumulative += d.count;
    return { month: d.month, added: d.count, total: cumulative };
  });

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-4">Catalog Growth</h2>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A847" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4A847" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
            <XAxis
              dataKey="month"
              stroke="#6b6b80"
              fontSize={11}
              tickFormatter={(v) => {
                const [y, m] = v.split('-');
                return `${m}/${y.slice(2)}`;
              }}
            />
            <YAxis stroke="#6b6b80" fontSize={12} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip
              contentStyle={{ background: '#12121f', border: '1px solid #1e1e35', borderRadius: 8 }}
              labelStyle={{ color: '#e8e8f0' }}
              itemStyle={{ color: '#e8e8f0' }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'total' ? 'Cumulative' : 'Added',
              ]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#D4A847"
              fill="url(#growthGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
