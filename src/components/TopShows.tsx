'use client';

import { useState, useMemo } from 'react';

interface Show {
  id: string;
  title: string;
  episodesCount: number;
  category: string;
  language: string;
  createdAt: string;
  feedUrl: string | null;
  author: string;
}

type SortKey = 'episodesCount' | 'title' | 'category' | 'createdAt';

export default function TopShows({ shows }: { shows: Show[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('episodesCount');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...shows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'episodesCount') {
        cmp = a.episodesCount - b.episodesCount;
      } else if (sortKey === 'title' || sortKey === 'category') {
        cmp = (a[sortKey] || '').localeCompare(b[sortKey] || '');
      } else if (sortKey === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [shows, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="text-[#2a2f45] ml-1">⇅</span>;
    return <span className="text-[#D4A847] ml-1">{sortAsc ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-4">Top Shows by Episode Count</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e35]">
              <th className="text-left p-2 text-[#6b6b80] font-medium">#</th>
              <th
                className="text-left p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('title')}
              >
                Title <SortIcon k="title" />
              </th>
              <th
                className="text-right p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('episodesCount')}
              >
                Episodes <SortIcon k="episodesCount" />
              </th>
              <th
                className="text-left p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('category')}
              >
                Category <SortIcon k="category" />
              </th>
              <th
                className="text-left p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('createdAt')}
              >
                Created <SortIcon k="createdAt" />
              </th>
              <th className="text-left p-2 text-[#6b6b80] font-medium">Feed</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((show, i) => (
              <tr
                key={show.id}
                className="border-b border-[#1e1e35]/50 hover:bg-[#1a1a2e] transition-colors"
              >
                <td className="p-2 text-[#6b6b80]">{i + 1}</td>
                <td className="p-2 font-medium max-w-[300px] truncate" title={show.title}>
                  {show.title}
                </td>
                <td className="p-2 text-right font-mono text-[#D4A847]">
                  {show.episodesCount.toLocaleString()}
                </td>
                <td className="p-2">
                  <span className="bg-[#1e1e35] text-[#3B82F6] text-xs px-2 py-0.5 rounded-full">
                    {show.category}
                  </span>
                </td>
                <td className="p-2 text-[#6b6b80] text-xs">
                  {new Date(show.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {show.feedUrl && (
                    <a
                      href={show.feedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B82F6] hover:underline text-xs"
                    >
                      RSS ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
