'use client';

interface Props {
  totalPodcasts: number;
  totalEpisodes: number;
  avgEpisodesPerShow: number;
  totalCategories: number;
}

const cards = [
  { key: 'totalPodcasts', label: 'Total Podcasts', color: '#D4A847' },
  { key: 'totalEpisodes', label: 'Total Episodes', color: '#3B82F6' },
  { key: 'avgEpisodesPerShow', label: 'Avg Episodes/Show', color: '#D4A847' },
  { key: 'totalCategories', label: 'Categories', color: '#3B82F6' },
];

export default function OverviewCards(props: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5 hover:border-[#D4A847]/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6b6b80] text-sm font-medium">{card.label}</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: card.color }}>
            {(props[card.key as keyof Props] as number).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
