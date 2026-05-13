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

const COLORS = ['#D4A847', '#3B82F6', '#c49a3f', '#60A5FA', '#b08d35', '#93C5FD', '#D4A847'];

export default function DurationAnalysis({
  data,
  totalAnalyzed,
}: {
  data: DurationBucket[];
  totalAnalyzed: number;
}) {
  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Episode Duration Distribution</h2>
      <p className="text-[#6b6b80] text-sm mb-4">
        Based on {totalAnalyzed.toLocaleString()} episodes from top shows
      </p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <XAxis dataKey="range" stroke="#6b6b80" fontSize={11} tick={{ fill: '#e8e8f0' }} />
            <YAxis stroke="#6b6b80" fontSize={12} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip
              contentStyle={{ background: '#12121f', border: '1px solid #1e1e35', borderRadius: 8 }}
              labelStyle={{ color: '#e8e8f0' }}
              itemStyle={{ color: '#e8e8f0' }}
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
