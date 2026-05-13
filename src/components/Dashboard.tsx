'use client';

import Link from 'next/link';
import OverviewCards from '@/components/OverviewCards';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import CatalogGrowth from '@/components/CatalogGrowth';
import TopShows from '@/components/TopShows';
import DurationAnalysis from '@/components/DurationAnalysis';
import LanguageDistribution from '@/components/LanguageDistribution';
import FeedHealth from '@/components/FeedHealth';
import AdInventory from '@/components/AdInventory';
import RecentActivity from '@/components/RecentActivity';

interface DashboardData {
  fetchedAt: string;
  fetchDurationSec: number;
  stats: {
    totalPodcasts: number;
    totalEpisodes: number;
    avgEpisodesPerShow: number;
    totalCategories: number;
    categories: { name: string; count: number }[];
    languages: { name: string; count: number }[];
    catalogGrowth: { month: string; count: number }[];
    feedHealth: {
      withSpotifyId: number;
      withItunesId: number;
      withFeedUrl: number;
      withGoogleId: number;
      withIheartId: number;
      total: number;
    };
    durationDistribution: { range: string; count: number }[];
    totalAnalyzedEpisodes: number;
    adInventory: {
      withAdSlots: number;
      withoutAdSlots: number;
      totalAnalyzed: number;
      totalPreSlots: number;
      totalPostSlots: number;
      totalMidSlots: number;
    };
    recentlyCreated: any[];
    recentlyUpdated: any[];
  };
  topShows: any[];
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const { stats, topShows, fetchedAt } = data;

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
                Megaphone Analytics
              </h1>
              <p className="text-[#6b6b80] text-xs">Network Catalog Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1 bg-[#12121f] rounded-lg p-1">
              <span className="px-3 py-1.5 text-sm rounded-md bg-[#D4A847]/10 text-[#D4A847] font-medium">
                Catalog
              </span>
              <Link
                href="/analytics/"
                className="px-3 py-1.5 text-sm rounded-md text-[#6b6b80] hover:text-white transition-colors"
              >
                Analytics
              </Link>
            </nav>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#6b6b80]">
                {stats.totalPodcasts.toLocaleString()} shows · {stats.totalEpisodes.toLocaleString()} episodes
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <OverviewCards
          totalPodcasts={stats.totalPodcasts}
          totalEpisodes={stats.totalEpisodes}
          avgEpisodesPerShow={stats.avgEpisodesPerShow}
          totalCategories={stats.totalCategories}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown categories={stats.categories} />
          <LanguageDistribution languages={stats.languages} />
        </div>

        <CatalogGrowth data={stats.catalogGrowth} />
        <TopShows shows={topShows} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DurationAnalysis
            data={stats.durationDistribution}
            totalAnalyzed={stats.totalAnalyzedEpisodes}
          />
          <AdInventory data={stats.adInventory} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeedHealth data={stats.feedHealth} />
          <RecentActivity
            created={stats.recentlyCreated}
            updated={stats.recentlyUpdated}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e35] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6b6b80]">
          <span>© 2026 Inception Point AI | Megaphone Analytics Platform</span>
          <span>
            Last updated:{' '}
            {new Date(fetchedAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        </div>
      </footer>
    </div>
  );
}
