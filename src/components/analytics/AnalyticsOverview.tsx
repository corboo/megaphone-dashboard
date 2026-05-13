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
  { key: 'totalDownloads', label: 'Total Downloads', color: '#D4A847' },
  { key: 'totalImpressions', label: 'Ad Impressions', color: '#3B82F6' },
  { key: 'avgDailyDownloads', label: 'Avg Daily Downloads', color: '#D4A847' },
  { key: 'uniqueCountries', label: 'Countries Reached', color: '#3B82F6' },
  { key: 'uniquePodcasts', label: 'Active Shows', color: '#D4A847' },
  { key: 'uniqueEpisodes', label: 'Episodes Played', color: '#3B82F6' },
  { key: 'uniquePlatforms', label: 'Platforms', color: '#D4A847' },
  { key: 'fillRate', label: 'Ad Fill Rate', color: '#22c55e', suffix: '%' },
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
            className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-4 hover:border-[#D4A847]/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6b6b80] text-xs font-medium">{card.label}</span>
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
