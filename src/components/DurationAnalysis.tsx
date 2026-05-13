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

interface DurationBucket {
  range: string;
  count: number;
}

const COLORS = ['#22c55e', '#4ade80', '#6366f1', '#818cf8', '#f97316', '#fb923c', '#ef4444'];

export default function DurationAnalysis({
  data,
  totalAnalyzed,
}: {
  data: DurationBucket[];
  totalAnalyzed: number;
}) {
  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-1">⏱️ Episode Duration Distribution</h2>
      <p className="text-[#8b90a5] text-sm mb-4">
        Based on {totalAnalyzed.toLocaleString()} episodes from top shows
      </p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <XAxis dataKey="range" stroke="#8b90a5" fontSize={11} tick={{ fill: '#e4e6f0' }} />
            <YAxis stroke="#8b90a5" fontSize={12} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip
              contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
              labelStyle={{ color: '#e4e6f0' }}
              itemStyle={{ color: '#e4e6f0' }}
              formatter={(value: number) => [value.toLocaleString(), 'Episodes']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
