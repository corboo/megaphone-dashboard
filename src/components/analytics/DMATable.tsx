'use client';

import ExpandableList from '../ExpandableList';

interface Props {
  data: { dma: string; count: number }[];
}

export default function DMATable({ data }: Props) {
  const maxCount = data.length > 0 ? data[0].count : 1;
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Top US Markets (DMA)</h2>
      <p className="text-[#6b6b80] text-sm mb-4">
        {data.length.toLocaleString()} markets · {total.toLocaleString()} US downloads with DMA data
      </p>
      <ExpandableList
        items={data}
        defaultLimit={20}
        stepLimit={50}
        label="markets"
        renderItems={(visibleItems) => (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {visibleItems.map((d, i) => {
              const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0';
              const rank = data.indexOf(d) + 1;
              return (
                <div key={d.dma} className="flex items-center gap-3">
                  <span className="text-[#6b6b80] text-xs w-6 text-right flex-shrink-0">{rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm truncate" title={d.dma}>{d.dma}</span>
                      <span className="text-xs text-[#6b6b80] flex-shrink-0 ml-2">
                        {d.count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1e1e35] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D4A847]"
                        style={{ width: `${(d.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      />
    </div>
  );
}
