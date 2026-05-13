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

  const COLORS = ['#D4A847', '#3B82F6'];

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Ad Inventory Overview</h2>
      <p className="text-[#6b6b80] text-sm mb-4">
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
                contentStyle={{ background: '#12121f', border: '1px solid #1e1e35', borderRadius: 8 }}
                formatter={(value: number) => [value.toLocaleString(), 'Episodes']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#D4A847]" />
            <span className="text-sm">
              <strong className="text-[#D4A847]">{data.withAdSlots.toLocaleString()}</strong>{' '}
              <span className="text-[#6b6b80]">episodes with ad slots</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
            <span className="text-sm">
              <strong className="text-[#3B82F6]">{data.withoutAdSlots.toLocaleString()}</strong>{' '}
              <span className="text-[#6b6b80]">episodes without ad slots</span>
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1e1e35]">
            <h3 className="text-sm font-medium text-[#6b6b80] mb-2">Slot Breakdown</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[#D4A847]">{data.totalPreSlots.toLocaleString()}</div>
                <div className="text-xs text-[#6b6b80]">Pre-Roll</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#3B82F6]">{data.totalMidSlots.toLocaleString()}</div>
                <div className="text-xs text-[#6b6b80]">Mid-Roll</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#c49a3f]">{data.totalPostSlots.toLocaleString()}</div>
                <div className="text-xs text-[#6b6b80]">Post-Roll</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
