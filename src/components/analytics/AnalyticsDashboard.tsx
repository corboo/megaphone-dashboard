'use client';

import { useState, useMemo, useCallback } from 'react';
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
import DateRangePicker from './DateRangePicker';
import CategoryAnalysis from './CategoryAnalysis';
import Link from 'next/link';

// Per-day data shape
interface DayData {
  downloads: number;
  impressions: number;
  byCountry: { country: string; count: number }[];
  byPlatform: { platform: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byDeviceCategory: { category: string; count: number }[];
  byDMA: { dma: string; count: number }[];
  topPodcasts: { podcast_id: string; title: string; category: string; count: number; pct: string }[];
  topEpisodes: { episode_id: string; podcast_id: string; show: string; count: number; duration: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  geoBreakdown: { country: string; total: number; regions: { region: string; count: number }[] }[];
  impressionsByType: { pre: number; mid: number; post: number; other: number };
  fillRate: number;
  downloadsWithAds: number;
  uniquePodcasts: number;
  uniqueEpisodes: number;
  uniqueCountries: number;
  uniquePlatforms: number;
}

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
    spotifyFollowers?: number;
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
  byDay?: Record<string, DayData>;
}

/** Merge multiple days' dimension arrays by summing counts */
function mergeDimension<T extends Record<string, any>>(
  days: T[][],
  keyField: string,
  countField: string = 'count'
): T[] {
  const map = new Map<string, T>();
  for (const dayArr of days) {
    for (const item of dayArr) {
      const key = item[keyField];
      const existing = map.get(key);
      if (existing) {
        (existing as any)[countField] = (existing as any)[countField] + item[countField];
      } else {
        map.set(key, { ...item });
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (b as any)[countField] - (a as any)[countField]
  );
}

/** Merge podcast arrays, recalculating pct */
function mergePodcasts(
  days: DayData['topPodcasts'][],
  totalDownloads: number
) {
  const map = new Map<string, DayData['topPodcasts'][0]>();
  for (const dayArr of days) {
    for (const item of dayArr) {
      const existing = map.get(item.podcast_id);
      if (existing) {
        existing.count += item.count;
      } else {
        map.set(item.podcast_id, { ...item });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .map((p) => ({
      ...p,
      pct: totalDownloads > 0 ? ((p.count / totalDownloads) * 100).toFixed(1) : '0.0',
    }));
}

/** Merge episode arrays */
function mergeEpisodes(days: DayData['topEpisodes'][]) {
  const map = new Map<string, DayData['topEpisodes'][0]>();
  for (const dayArr of days) {
    for (const item of dayArr) {
      const existing = map.get(item.episode_id);
      if (existing) {
        existing.count += item.count;
      } else {
        map.set(item.episode_id, { ...item });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/** Merge hourly distributions */
function mergeHourly(days: DayData['hourlyDistribution'][]) {
  const byHour: number[] = new Array(24).fill(0);
  for (const dayArr of days) {
    for (const item of dayArr) {
      byHour[item.hour] += item.count;
    }
  }
  return byHour.map((count, hour) => ({ hour, count }));
}

/** Merge geo breakdown */
function mergeGeo(days: DayData['geoBreakdown'][]) {
  const map = new Map<
    string,
    { country: string; total: number; regions: Map<string, number> }
  >();
  for (const dayArr of days) {
    for (const item of dayArr) {
      let existing = map.get(item.country);
      if (!existing) {
        existing = { country: item.country, total: 0, regions: new Map() };
        map.set(item.country, existing);
      }
      existing.total += item.total;
      for (const r of item.regions) {
        existing.regions.set(r.region, (existing.regions.get(r.region) || 0) + r.count);
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      country: item.country,
      total: item.total,
      regions: Array.from(item.regions.entries())
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count),
    }));
}

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const availableDates = useMemo(
    () =>
      data.byDay
        ? Object.keys(data.byDay).sort()
        : data.dailyDownloads.map((d) => d.date).sort(),
    [data]
  );

  const [startDate, setStartDate] = useState(availableDates[0]);
  const [endDate, setEndDate] = useState(availableDates[availableDates.length - 1]);

  const handleDateChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const isFullRange =
    startDate === availableDates[0] && endDate === availableDates[availableDates.length - 1];

  // Compute filtered data
  const filtered = useMemo(() => {
    // If showing full range or no byDay data, use totals directly
    if (isFullRange || !data.byDay) {
      return {
        summary: data.summary,
        dailyDownloads: data.dailyDownloads,
        dailyImpressions: data.dailyImpressions,
        byCountry: data.byCountry,
        byPlatform: data.byPlatform,
        byDevice: data.byDevice,
        byDeviceCategory: data.byDeviceCategory,
        byDMA: data.byDMA,
        topPodcasts: data.topPodcasts,
        topEpisodes: data.topEpisodes,
        hourlyDistribution: data.hourlyDistribution,
        impressionsByType: data.impressionsByType,
        geoBreakdown: data.geoBreakdown,
        dateRange: data.dateRange,
      };
    }

    // Filter to selected dates
    const selectedDates = availableDates.filter(
      (d) => d >= startDate && d <= endDate
    );
    const dayDataArr = selectedDates
      .map((d) => data.byDay![d])
      .filter(Boolean);

    // Aggregate across selected days
    const totalDownloads = dayDataArr.reduce((s, d) => s + d.downloads, 0);
    const totalImpressions = dayDataArr.reduce((s, d) => s + d.impressions, 0);
    const downloadsWithAds = dayDataArr.reduce((s, d) => s + d.downloadsWithAds, 0);

    const byCountry = mergeDimension(
      dayDataArr.map((d) => d.byCountry),
      'country'
    );
    const byPlatform = mergeDimension(
      dayDataArr.map((d) => d.byPlatform),
      'platform'
    );
    const byDevice = mergeDimension(
      dayDataArr.map((d) => d.byDevice),
      'device'
    );
    const byDeviceCategory = mergeDimension(
      dayDataArr.map((d) => d.byDeviceCategory),
      'category'
    );
    const byDMA = mergeDimension(
      dayDataArr.map((d) => d.byDMA),
      'dma'
    );
    const topPodcasts = mergePodcasts(
      dayDataArr.map((d) => d.topPodcasts),
      totalDownloads
    );
    const topEpisodes = mergeEpisodes(dayDataArr.map((d) => d.topEpisodes));
    const hourlyDistribution = mergeHourly(
      dayDataArr.map((d) => d.hourlyDistribution)
    );
    const geoBreakdown = mergeGeo(dayDataArr.map((d) => d.geoBreakdown));

    // Merge impression types
    const impressionsByType = { pre: 0, mid: 0, post: 0, other: 0 };
    dayDataArr.forEach((d) => {
      impressionsByType.pre += d.impressionsByType.pre;
      impressionsByType.mid += d.impressionsByType.mid;
      impressionsByType.post += d.impressionsByType.post;
      impressionsByType.other += d.impressionsByType.other;
    });

    const fillRate =
      totalDownloads > 0
        ? parseFloat(((downloadsWithAds / totalDownloads) * 100).toFixed(1))
        : 0;

    // Filtered daily downloads/impressions
    const dailyDownloads = data.dailyDownloads.filter(
      (d) => d.date >= startDate && d.date <= endDate
    );
    const dailyImpressions = data.dailyImpressions.filter(
      (d) => d.date >= startDate && d.date <= endDate
    );

    return {
      summary: {
        totalDownloads,
        totalImpressions,
        uniqueDownloads: totalDownloads,
        downloadsWithAds,
        fillRate,
        avgDailyDownloads:
          selectedDates.length > 0 ? Math.round(totalDownloads / selectedDates.length) : 0,
        avgDailyImpressions:
          selectedDates.length > 0 ? Math.round(totalImpressions / selectedDates.length) : 0,
        uniquePodcasts: topPodcasts.length,
        uniqueEpisodes: topEpisodes.length,
        uniqueCountries: byCountry.length,
        uniquePlatforms: byPlatform.length,
      },
      dailyDownloads,
      dailyImpressions,
      byCountry,
      byPlatform,
      byDevice,
      byDeviceCategory,
      byDMA,
      topPodcasts,
      topEpisodes,
      hourlyDistribution,
      impressionsByType,
      geoBreakdown,
      dateRange: {
        start: startDate,
        end: endDate,
        days: selectedDates.length,
      },
    };
  }, [data, startDate, endDate, isFullRange, availableDates]);

  const { summary, dateRange } = filtered;

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
                {!isFullRange && <span className="text-[#3B82F6] ml-1">(filtered)</span>}
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
        {/* Date Range Picker */}
        <DateRangePicker
          availableDates={availableDates}
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
        />

        <AnalyticsOverview summary={summary} />
        <DailyDownloadsChart
          downloads={filtered.dailyDownloads}
          impressions={filtered.dailyImpressions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CountryChart data={filtered.byCountry} />
          <PlatformChart data={filtered.byPlatform} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceChart data={filtered.byDeviceCategory} />
          <HourlyChart data={filtered.hourlyDistribution} />
        </div>

        {/* Category Analysis Section */}
        <CategoryAnalysis
          shows={filtered.topPodcasts}
          totalDownloads={summary.totalDownloads}
        />

        <TopShowsTable shows={filtered.topPodcasts} totalDownloads={summary.totalDownloads} />
        <TopEpisodesTable episodes={filtered.topEpisodes} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DMATable data={filtered.byDMA} />
          <GeoBreakdown data={filtered.geoBreakdown} />
        </div>

        <AdImpressionsSummary
          impressionsByType={filtered.impressionsByType}
          totalImpressions={summary.totalImpressions}
          totalDownloads={summary.totalDownloads}
          fillRate={summary.fillRate}
          downloadsWithAds={summary.downloadsWithAds}
          dailyImpressions={filtered.dailyImpressions}
        />
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
