'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Category {
  name: string;
  count: number;
}

const COLORS = [
  '#D4A847', '#3B82F6', '#c49a3f', '#60A5FA', '#b08d35',
  '#93C5FD', '#D4A847', '#3B82F6', '#c49a3f', '#60A5FA',
  '#b08d35', '#93C5FD', '#D4A847', '#3B82F6', '#c49a3f',
  '#60A5FA', '#b08d35', '#93C5FD', '#D4A847', '#3B82F6',
];

export default function CategoryBreakdown({ categories }: { categories: Category[] }) {
  const top20 = categories.slice(0, 20);

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-4">Top 20 Categories</h2>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top20} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" stroke="#6b6b80" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6b6b80"
              fontSize={12}
              width={115}
              tick={{ fill: '#e8e8f0' }}
            />
            <Tooltip
              contentStyle={{ background: '#12121f', border: '1px solid #1e1e35', borderRadius: 8 }}
              labelStyle={{ color: '#e8e8f0' }}
              itemStyle={{ color: '#e8e8f0' }}
              formatter={(value: number) => [value.toLocaleString(), 'Shows']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {top20.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
