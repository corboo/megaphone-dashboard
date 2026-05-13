'use client';

interface Props {
  summary: {
    totalDownloads: number;
    totalImpressions: number;
    avgDailyDownloads: number;
    avgDailyImpressions: number;
    fillRate: number;
    uniquePodcasts: number;
    uniqueEpisodes: number;
    uniqueCountries: number;
    uniquePlatforms: number;
  };
}

const cards = [
  { key: 'totalDownloads', label: 'Total Downloads', icon: '📥', color: '#6366f1' },
  { key: 'totalImpressions', label: 'Ad Impressions', icon: '📢', color: '#22c55e' },
  { key: 'avgDailyDownloads', label: 'Avg Daily Downloads', icon: '📈', color: '#f97316' },
  { key: 'uniqueCountries', label: 'Countries Reached', icon: '🌍', color: '#06b6d4' },
  { key: 'uniquePodcasts', label: 'Active Shows', icon: '🎙️', color: '#a855f7' },
  { key: 'uniqueEpisodes', label: 'Episodes Played', icon: '🎧', color: '#eab308' },
  { key: 'uniquePlatforms', label: 'Platforms', icon: '📱', color: '#ec4899' },
  { key: 'fillRate', label: 'Ad Fill Rate', icon: '💰', color: '#22c55e', suffix: '%' },
];

export default function AnalyticsOverview({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const val = summary[card.key as keyof Props['summary']];
        const display = card.suffix
          ? `${val}${card.suffix}`
          : typeof val === 'number'
            ? val.toLocaleString()
            : val;
        return (
          <div
            key={card.key}
            className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-4 hover:border-[#3a3f55] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#8b90a5] text-xs font-medium">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: card.color }}>
              {display}
            </div>
          </div>
        );
      })}
    </div>
  );
}
