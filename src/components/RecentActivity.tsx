'use client';

import { useState } from 'react';

interface PodcastEntry {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  episodesCount: number;
  category: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function RecentActivity({
  created,
  updated,
}: {
  created: PodcastEntry[];
  updated: PodcastEntry[];
}) {
  const [tab, setTab] = useState<'created' | 'updated'>('created');
  const items = tab === 'created' ? created : updated;

  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-4">🕐 Recent Activity</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('created')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            tab === 'created'
              ? 'bg-[#6366f1] text-white'
              : 'bg-[#2a2f45] text-[#8b90a5] hover:bg-[#3a3f55]'
          }`}
        >
          Recently Created
        </button>
        <button
          onClick={() => setTab('updated')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            tab === 'updated'
              ? 'bg-[#6366f1] text-white'
              : 'bg-[#2a2f45] text-[#8b90a5] hover:bg-[#3a3f55]'
          }`}
        >
          Recently Updated
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg bg-[#252940] hover:bg-[#2a2f50] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.title}</div>
              <div className="flex gap-3 mt-1 text-xs text-[#8b90a5]">
                <span>{item.episodesCount} episodes</span>
                <span className="bg-[#2a2f45] text-[#a78bfa] px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="text-right ml-3 flex-shrink-0">
              <div className="text-xs text-[#6366f1] font-medium">
                {timeAgo(tab === 'created' ? item.createdAt : item.updatedAt)}
              </div>
              <div className="text-[10px] text-[#8b90a5]">
                {formatDate(tab === 'created' ? item.createdAt : item.updatedAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
