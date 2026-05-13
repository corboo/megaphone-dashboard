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
      <header className="border-b border-[#2a2f45] bg-[#1a1d2e]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              📊 Megaphone Listener Analytics
            </h1>
            <p className="text-[#8b90a5] text-sm">
              Inception Point AI — {formatDate(dateRange.start)} to {formatDate(dateRange.end)} ({dateRange.days} days)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[#818cf8] hover:text-[#a5b4fc] transition-colors flex items-center gap-1"
            >
              📡 Catalog
            </Link>
            <div className="text-right">
              <div className="text-xs text-[#8b90a5]">
                {summary.totalDownloads.toLocaleString()} downloads · {summary.totalImpressions.toLocaleString()} impressions
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <AnalyticsOverview summary={summary} />

        {/* Daily Downloads Chart */}
        <DailyDownloadsChart
          downloads={data.dailyDownloads}
          impressions={data.dailyImpressions}
        />

        {/* Row: Country + Platform */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CountryChart data={data.byCountry} />
          <PlatformChart data={data.byPlatform} />
        </div>

        {/* Row: Device + Hourly */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceChart data={data.byDeviceCategory} />
          <HourlyChart data={data.hourlyDistribution} />
        </div>

        {/* Ad Impressions Summary */}
        <AdImpressionsSummary
          impressionsByType={data.impressionsByType}
          totalImpressions={summary.totalImpressions}
          totalDownloads={summary.totalDownloads}
          fillRate={summary.fillRate}
          downloadsWithAds={summary.downloadsWithAds}
          dailyImpressions={data.dailyImpressions}
        />

        {/* Top Shows */}
        <TopShowsTable shows={data.topPodcasts} totalDownloads={summary.totalDownloads} />

        {/* Top Episodes */}
        <TopEpisodesTable episodes={data.topEpisodes} />

        {/* Row: DMA + Geography */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DMATable data={data.byDMA} />
          <GeoBreakdown data={data.geoBreakdown} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2f45] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-[#8b90a5]">
          Data from Megaphone Metrics API | Generated:{' '}
          {new Date(data.generatedAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
          {' | '}
          <Link href="/" className="text-[#818cf8] hover:text-[#a5b4fc]">
            ← Back to Catalog Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
