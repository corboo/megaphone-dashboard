'use client';

interface Props {
  totalPodcasts: number;
  totalEpisodes: number;
  avgEpisodesPerShow: number;
  totalCategories: number;
}

const cards = [
  { key: 'totalPodcasts', label: 'Total Podcasts', icon: '🎙️', color: '#6366f1' },
  { key: 'totalEpisodes', label: 'Total Episodes', icon: '📻', color: '#22c55e' },
  { key: 'avgEpisodesPerShow', label: 'Avg Episodes/Show', icon: '📊', color: '#f97316' },
  { key: 'totalCategories', label: 'Categories', icon: '🏷️', color: '#06b6d4' },
];

export default function OverviewCards(props: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5 hover:border-[#3a3f55] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#8b90a5] text-sm font-medium">{card.label}</span>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: card.color }}>
            {(props[card.key as keyof Props] as number).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
