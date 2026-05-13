'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface AdData {
  withAdSlots: number;
  withoutAdSlots: number;
  totalAnalyzed: number;
  totalPreSlots: number;
  totalPostSlots: number;
  totalMidSlots: number;
}

export default function AdInventory({ data }: { data: AdData }) {
  const pieData = [
    { name: 'With Ad Slots', value: data.withAdSlots },
    { name: 'No Ad Slots', value: data.withoutAdSlots },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-1">💰 Ad Inventory Overview</h2>
      <p className="text-[#8b90a5] text-sm mb-4">
        Based on {data.totalAnalyzed.toLocaleString()} episodes from top shows
      </p>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e2235', border: '1px solid #2a2f45', borderRadius: 8 }}
                formatter={(value: number) => [value.toLocaleString(), 'Episodes']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-sm">
              <strong className="text-[#22c55e]">{data.withAdSlots.toLocaleString()}</strong>{' '}
              <span className="text-[#8b90a5]">episodes with ad slots</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span className="text-sm">
              <strong className="text-[#ef4444]">{data.withoutAdSlots.toLocaleString()}</strong>{' '}
              <span className="text-[#8b90a5]">episodes without ad slots</span>
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-[#2a2f45]">
            <h3 className="text-sm font-medium text-[#8b90a5] mb-2">Slot Breakdown</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[#6366f1]">{data.totalPreSlots.toLocaleString()}</div>
                <div className="text-xs text-[#8b90a5]">Pre-Roll</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#f97316]">{data.totalMidSlots.toLocaleString()}</div>
                <div className="text-xs text-[#8b90a5]">Mid-Roll</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#a855f7]">{data.totalPostSlots.toLocaleString()}</div>
                <div className="text-xs text-[#8b90a5]">Post-Roll</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
