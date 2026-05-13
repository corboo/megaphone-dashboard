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
      <header className="border-b border-[#2a2f45] bg-[#1a1d2e]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              📡 Megaphone Analytics
            </h1>
            <p className="text-[#8b90a5] text-sm">Inception Point AI — Network Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/analytics/"
              className="text-sm text-[#818cf8] hover:text-[#a5b4fc] transition-colors flex items-center gap-1"
            >
              📊 Listener Analytics
            </Link>
            <div className="text-right">
              <div className="text-xs text-[#8b90a5]">
                {stats.totalPodcasts.toLocaleString()} shows · {stats.totalEpisodes.toLocaleString()} episodes
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <OverviewCards
          totalPodcasts={stats.totalPodcasts}
          totalEpisodes={stats.totalEpisodes}
          avgEpisodesPerShow={stats.avgEpisodesPerShow}
          totalCategories={stats.totalCategories}
        />

        {/* Row: Category + Language */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown categories={stats.categories} />
          <LanguageDistribution languages={stats.languages} />
        </div>

        {/* Catalog Growth */}
        <CatalogGrowth data={stats.catalogGrowth} />

        {/* Top Shows */}
        <TopShows shows={topShows} />

        {/* Row: Duration + Ad Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DurationAnalysis
            data={stats.durationDistribution}
            totalAnalyzed={stats.totalAnalyzedEpisodes}
          />
          <AdInventory data={stats.adInventory} />
        </div>

        {/* Row: Feed Health + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeedHealth data={stats.feedHealth} />
          <RecentActivity
            created={stats.recentlyCreated}
            updated={stats.recentlyUpdated}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2f45] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-[#8b90a5]">
          Data from Megaphone API | Last updated:{' '}
          {new Date(fetchedAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>
      </footer>
    </div>
  );
}
