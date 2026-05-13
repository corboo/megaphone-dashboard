'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';

interface Props {
  downloads: { date: string; count: number }[];
  impressions: { date: string; count: number }[];
}

export default function DailyDownloadsChart({ downloads, impressions }: Props) {
  // Merge downloads and impressions by date
  const impMap: Record<string, number> = {};
  impressions.forEach((d) => { impMap[d.date] = d.count; });

  const data = downloads.map((d) => ({
    date: d.date,
    downloads: d.count,
    impressions: impMap[d.date] || 0,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-1">📈 Daily Downloads & Impressions</h2>
      <p className="text-[#8b90a5] text-sm mb-4">
        Download events and ad impressions by day
      </p>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
            <XAxis dataKey="label" stroke="#8b90a5" fontSize={12} />
            <YAxis stroke="#8b90a5" fontSize={12} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
            <Tooltip
              contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
            />
            <Legend />
            <Bar dataKey="downloads" name="Downloads" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="impressions"
              name="Impressions"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
