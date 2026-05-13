'use client';

interface Props {
  data: { dma: string; count: number }[];
}

export default function DMATable({ data }: Props) {
  const maxCount = data.length > 0 ? data[0].count : 1;
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-1">📍 Top US Markets (DMA)</h2>
      <p className="text-[#8b90a5] text-sm mb-4">
        Designated Market Areas · {total.toLocaleString()} US downloads with DMA data
      </p>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0';
          return (
            <div key={d.dma} className="flex items-center gap-3">
              <span className="text-[#8b90a5] text-xs w-6 text-right flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-sm truncate" title={d.dma}>{d.dma}</span>
                  <span className="text-xs text-[#8b90a5] flex-shrink-0 ml-2">
                    {d.count.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#2a2f45] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#f97316]"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
