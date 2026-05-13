'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import ShowMoreToggle from '@/components/ui/ShowMoreToggle';

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

const DEFAULT_VISIBLE = 20;

export default function CategoryBreakdown({ categories }: { categories: Category[] }) {
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE);
  const visible = categories.slice(0, visibleCount);

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-4">Top {Math.min(visibleCount, categories.length)} Categories</h2>
      <div style={{ height: Math.max(400, visible.length * 25) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={visible} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
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
              {visible.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ShowMoreToggle
        total={categories.length}
        visible={visibleCount}
        onShowMore={() => setVisibleCount(categories.length)}
        onShowLess={() => setVisibleCount(DEFAULT_VISIBLE)}
      />
    </div>
  );
}
