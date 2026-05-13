'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LangEntry {
  name: string;
  count: number;
}

const COLORS = [
  '#6366f1', '#22c55e', '#f97316', '#06b6d4', '#a855f7',
  '#eab308', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6',
  '#f43f5e', '#84cc16', '#0ea5e9', '#d946ef', '#fbbf24',
];

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  it: 'Italian',
  nl: 'Dutch',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
  unknown: 'Unknown',
};

export default function LanguageDistribution({ languages }: { languages: LangEntry[] }) {
  // Top 10 + "Other"
  const top10 = languages.slice(0, 10);
  const otherCount = languages.slice(10).reduce((s, l) => s + l.count, 0);
  const chartData = [
    ...top10.map((l) => ({ name: LANG_LABELS[l.name] || l.name, count: l.count })),
    ...(otherCount > 0 ? [{ name: 'Other', count: otherCount }] : []),
  ];

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-4">🌍 Language Distribution</h2>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              dataKey="count"
              nameKey="name"
              label={({ name, percent }) =>
                percent > 0.03 ? `${name} (${(percent * 100).toFixed(1)}%)` : ''
              }
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
              labelStyle={{ color: '#e4e6f0' }}
              itemStyle={{ color: '#e4e6f0' }}
              formatter={(value: number) => [value.toLocaleString(), 'Shows']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {chartData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1 text-xs text-[#8b90a5]">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {d.name}: {d.count.toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}
