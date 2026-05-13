'use client';

import DailyDownloadsChart from './DailyDownloadsChart';
import CountryChart from './CountryChart';
import PlatformChart from './PlatformChart';
import DeviceChart from './DeviceChart';
import DMATable from './DMATable';
import TopShowsTable from './TopShowsTable';
import TopEpisodesTable from './TopEpisodesTable';
import HourlyChart from './HourlyChart';
import AdImpressionsSummary from './AdImpressionsSummary';
import GeoBreakdown from './GeoBreakdown';
import AnalyticsOverview from './AnalyticsOverview';
import Link from 'next/link';

export interface AnalyticsData {
  generatedAt: string;
  dateRange: { start: string; end: string; days: number };
  summary: {
    totalDownloads: number;
    totalImpressions: number;
    uniqueDownloads: number;
    downloadsWithAds: number;
    fillRate: number;
    avgDailyDownloads: number;
    avgDailyImpressions: number;
    uniquePodcasts: number;
    uniqueEpisodes: number;
    uniqueCountries: number;
    uniquePlatforms: number;
  };
  dailyDownloads: { date: string; count: number }[];
  dailyImpressions: { date: string; count: number }[];
  byCountry: { country: string; count: number }[];
  byPlatform: { platform: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byDeviceCategory: { category: string; count: number }[];
  byDMA: { dma: string; count: number }[];
  topPodcasts: { podcast_id: string; title: string; category: string; count: number; pct: string }[];
  topEpisodes: { episode_id: string; podcast_id: string; show: string; count: number; duration: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  impressionsByType: { pre: number; mid: number; post: number; other: number };
  impressionsBySource: Record<string, number>;
  geoBreakdown: { country: string; total: number; regions: { region: string; count: number }[] }[];
}

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { summary, dateRange } = data;

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#1e1e35] bg-[#10101f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://www.inceptionpoint.ai/wp-content/uploads/2025/08/cropped-Inception-Point-Logo-FINAL-RGB.png"
              alt="IPAI"
              className="h-8 w-auto brightness-150"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">
                Listener Analytics
              </h1>
              <p className="text-[#6b6b80] text-xs">
                {formatDate(dateRange.start)} — {formatDate(dateRange.end)} ({dateRange.days} days)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1 bg-[#12121f] rounded-lg p-1">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm rounded-md text-[#6b6b80] hover:text-white transition-colors"
              >
                Catalog
              </Link>
              <span className="px-3 py-1.5 text-sm rounded-md bg-[#D4A847]/10 text-[#D4A847] font-medium">
                Analytics
              </span>
            </nav>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#6b6b80]">
                {summary.totalDownloads.toLocaleString()} downloads · {summary.totalImpressions.toLocaleString()} impressions
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <AnalyticsOverview summary={summary} />
        <DailyDownloadsChart
          downloads={data.dailyDownloads}
          impressions={data.dailyImpressions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CountryChart data={data.byCountry} />
          <PlatformChart data={data.byPlatform} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceChart data={data.byDeviceCategory} />
          <HourlyChart data={data.hourlyDistribution} />
        </div>

        <AdImpressionsSummary
          impressionsByType={data.impressionsByType}
          totalImpressions={summary.totalImpressions}
          totalDownloads={summary.totalDownloads}
          fillRate={summary.fillRate}
          downloadsWithAds={summary.downloadsWithAds}
          dailyImpressions={data.dailyImpressions}
        />

        <TopShowsTable shows={data.topPodcasts} totalDownloads={summary.totalDownloads} />
        <TopEpisodesTable episodes={data.topEpisodes} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DMATable data={data.byDMA} />
          <GeoBreakdown data={data.geoBreakdown} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e35] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6b6b80]">
          <span>© 2026 Inception Point AI | Megaphone Analytics Platform</span>
          <span>
            Generated:{' '}
            {new Date(data.generatedAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        </div>
      </footer>
    </div>
  );
}
