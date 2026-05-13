'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  impressionsByType: { pre: number; mid: number; post: number; other: number };
  totalImpressions: number;
  totalDownloads: number;
  fillRate: number;
  downloadsWithAds: number;
  dailyImpressions: { date: string; count: number }[];
}

export default function AdImpressionsSummary({
  impressionsByType,
  totalImpressions,
  totalDownloads,
  fillRate,
  downloadsWithAds,
}: Props) {
  const typeData = [
    { name: 'Pre-Roll', value: impressionsByType.pre, color: '#D4A847' },
    { name: 'Mid-Roll', value: impressionsByType.mid, color: '#3B82F6' },
    { name: 'Post-Roll', value: impressionsByType.post, color: '#10B981' },
  ];

  if (impressionsByType.other > 0) {
    typeData.push({ name: 'Other', value: impressionsByType.other, color: '#6b6b80' });
  }

  const impPerDownload = totalDownloads > 0 ? (totalImpressions / totalDownloads).toFixed(2) : '0';

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Ad Impressions Summary</h2>
      <p className="text-[#6b6b80] text-sm mb-4">Ad serving performance across the network</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0a0a1a] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#D4A847]">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-xs text-[#6b6b80] mt-1">Total Impressions</div>
        </div>
        <div className="bg-[#0a0a1a] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#3B82F6]">
            {fillRate}%
          </div>
          <div className="text-xs text-[#6b6b80] mt-1">Fill Rate</div>
        </div>
        <div className="bg-[#0a0a1a] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#c49a3f]">
            {impPerDownload}
          </div>
          <div className="text-xs text-[#6b6b80] mt-1">Impressions/Download</div>
        </div>
        <div className="bg-[#0a0a1a] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#60A5FA]">
            {downloadsWithAds.toLocaleString()}
          </div>
          <div className="text-xs text-[#6b6b80] mt-1">Downloads w/ Ads</div>
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[#6b6b80] mb-3">By Position</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
                <XAxis dataKey="name" stroke="#6b6b80" fontSize={12} />
                <YAxis
                  stroke="#6b6b80"
                  fontSize={11}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
                />
                <Tooltip
                  contentStyle={{ background: '#12121f', border: '1px solid #1e1e35', borderRadius: 8 }}
                  formatter={(value: number) => [value.toLocaleString(), 'Impressions']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[#6b6b80] mb-3">Breakdown</h3>
          <div className="space-y-3">
            {typeData.map((t) => {
              const pct = totalImpressions > 0 ? ((t.value / totalImpressions) * 100).toFixed(1) : '0';
              return (
                <div key={t.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.name}</span>
                    <span className="font-mono" style={{ color: t.color }}>
                      {t.value.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1e1e35] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${parseFloat(pct)}%`,
                        backgroundColor: t.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#1e1e35]">
            <div className="flex justify-between text-sm">
              <span className="text-[#6b6b80]">Fill Rate</span>
              <span className="font-mono text-[#22c55e]">{fillRate}%</span>
            </div>
            <div className="w-full h-3 bg-[#1e1e35] rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-[#22c55e]"
                style={{ width: `${fillRate}%` }}
              />
            </div>
            <p className="text-xs text-[#6b6b80] mt-1">
              {downloadsWithAds.toLocaleString()} of {totalDownloads.toLocaleString()} downloads served ads
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
