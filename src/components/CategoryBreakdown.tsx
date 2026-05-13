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
  '#6366f1', '#818cf8', '#a78bfa', '#c4b5fd',
  '#22c55e', '#4ade80', '#86efac',
  '#f97316', '#fb923c', '#fdba74',
  '#06b6d4', '#22d3ee', '#67e8f9',
  '#a855f7', '#c084fc', '#d8b4fe',
  '#eab308', '#facc15', '#fde047',
  '#ef4444',
];

export default function CategoryBreakdown({ categories }: { categories: Category[] }) {
  const top20 = categories.slice(0, 20);

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-4">🏷️ Top 20 Categories</h2>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top20} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" stroke="#8b90a5" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#8b90a5"
              fontSize={12}
              width={115}
              tick={{ fill: '#e4e6f0' }}
            />
            <Tooltip
              contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
              labelStyle={{ color: '#e4e6f0' }}
              itemStyle={{ color: '#e4e6f0' }}
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
