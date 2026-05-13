'use client';

import { useState, useMemo } from 'react';

interface Show {
  podcast_id: string;
  title: string;
  category: string;
  count: number;
  pct: string;
}

type SortKey = 'count' | 'title' | 'pct';

export default function TopShowsTable({ shows, totalDownloads }: { shows: Show[]; totalDownloads: number }) {
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...shows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'count') cmp = a.count - b.count;
      else if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortKey === 'pct') cmp = parseFloat(a.pct) - parseFloat(b.pct);
      return sortAsc ? cmp : -cmp;
    });
  }, [shows, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="text-[#2a2f45] ml-1">⇅</span>;
    return <span className="text-[#D4A847] ml-1">{sortAsc ? '↑' : '↓'}</span>;
  };

  const maxCount = shows.length > 0 ? shows[0].count : 1;

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Top Shows by Downloads</h2>
      <p className="text-[#6b6b80] text-sm mb-4">
        {shows.length} shows with downloads · {totalDownloads.toLocaleString()} total
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e35]">
              <th className="text-left p-2 text-[#6b6b80] font-medium w-10">#</th>
              <th
                className="text-left p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('title')}
              >
                Show <SortIcon k="title" />
              </th>
              <th className="text-left p-2 text-[#6b6b80] font-medium">Category</th>
              <th
                className="text-right p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('count')}
              >
                Downloads <SortIcon k="count" />
              </th>
              <th
                className="text-right p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white w-20"
                onClick={() => toggleSort('pct')}
              >
                Share <SortIcon k="pct" />
              </th>
              <th className="p-2 text-[#6b6b80] font-medium w-32"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 20).map((show, i) => (
              <tr
                key={show.podcast_id}
                className="border-b border-[#1e1e35]/50 hover:bg-[#1a1a2e] transition-colors"
              >
                <td className="p-2 text-[#6b6b80]">{i + 1}</td>
                <td className="p-2 font-medium max-w-[300px] truncate" title={show.title}>
                  {show.title}
                </td>
                <td className="p-2">
                  <span className="bg-[#1e1e35] text-[#3B82F6] text-xs px-2 py-0.5 rounded-full">
                    {show.category}
                  </span>
                </td>
                <td className="p-2 text-right font-mono text-[#D4A847]">
                  {show.count.toLocaleString()}
                </td>
                <td className="p-2 text-right font-mono text-[#6b6b80]">
                  {show.pct}%
                </td>
                <td className="p-2">
                  <div className="w-full h-2 bg-[#1e1e35] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#D4A847]"
                      style={{ width: `${(show.count / maxCount) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
