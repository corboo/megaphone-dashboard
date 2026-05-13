/**
 * Merges per-day breakdowns for a selected date range into aggregate data.
 * Used for date range filtering on the analytics page.
 */

export interface DailyBreakdown {
  downloads: number;
  impressions: number;
  downloadsWithAds: number;
  uniqueDownloads: number;
  byCountry: Record<string, number>;
  byPlatform: Record<string, number>;
  byDeviceCategory: Record<string, number>;
  byDMA: Record<string, number>;
  byPodcast: { podcast_id: string; title: string; category: string; count: number }[];
  byEpisode: { episode_id: string; podcast_id: string; show: string; count: number; duration: number }[];
  hourly: { hour: number; count: number }[];
  impressionsByType: { pre: number; mid: number; post: number; other: number };
  geoBreakdown: { country: string; total: number; regions: { region: string; count: number }[] }[];
}

export interface FilteredAnalytics {
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
  byDeviceCategory: { category: string; count: number }[];
  byDMA: { dma: string; count: number }[];
  topPodcasts: { podcast_id: string; title: string; category: string; count: number; pct: string }[];
  topEpisodes: { episode_id: string; podcast_id: string; show: string; count: number; duration: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  impressionsByType: { pre: number; mid: number; post: number; other: number };
  geoBreakdown: { country: string; total: number; regions: { region: string; count: number }[] }[];
}

function mergeRecordMaps(maps: Record<string, number>[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const m of maps) {
    for (const [k, v] of Object.entries(m)) {
      result[k] = (result[k] || 0) + v;
    }
  }
  return result;
}

export function filterByDateRange(
  dailyBreakdowns: Record<string, DailyBreakdown>,
  allDailyDownloads: { date: string; count: number }[],
  allDailyImpressions: { date: string; count: number }[],
  startDate: string,
  endDate: string,
): FilteredAnalytics {
  const selectedDates = Object.keys(dailyBreakdowns)
    .filter(d => d >= startDate && d <= endDate)
    .sort();

  const days = selectedDates.map(d => dailyBreakdowns[d]);

  // Aggregate scalars
  const totalDownloads = days.reduce((s, d) => s + d.downloads, 0);
  const totalImpressions = days.reduce((s, d) => s + d.impressions, 0);
  const totalDownloadsWithAds = days.reduce((s, d) => s + d.downloadsWithAds, 0);
  const totalUniqueDownloads = days.reduce((s, d) => s + d.uniqueDownloads, 0);
  const fillRate = totalUniqueDownloads > 0
    ? parseFloat(((totalDownloadsWithAds / totalUniqueDownloads) * 100).toFixed(1))
    : 0;

  // Daily downloads/impressions (filtered)
  const dailyDownloads = allDailyDownloads.filter(d => d.date >= startDate && d.date <= endDate);
  const dailyImpressions = allDailyImpressions.filter(d => d.date >= startDate && d.date <= endDate);

  // Merge record-based maps
  const byCountryMap = mergeRecordMaps(days.map(d => d.byCountry));
  const byPlatformMap = mergeRecordMaps(days.map(d => d.byPlatform));
  const byDevCatMap = mergeRecordMaps(days.map(d => d.byDeviceCategory));
  const byDMAMap = mergeRecordMaps(days.map(d => d.byDMA));

  const byCountry = Object.entries(byCountryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  const byPlatform = Object.entries(byPlatformMap)
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);

  const byDeviceCategory = Object.entries(byDevCatMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const byDMA = Object.entries(byDMAMap)
    .map(([dma, count]) => ({ dma, count }))
    .sort((a, b) => b.count - a.count);

  // Merge podcasts
  const podcastMap: Record<string, { podcast_id: string; title: string; category: string; count: number }> = {};
  for (const day of days) {
    for (const p of day.byPodcast) {
      if (!podcastMap[p.podcast_id]) {
        podcastMap[p.podcast_id] = { ...p, count: 0 };
      }
      podcastMap[p.podcast_id].count += p.count;
    }
  }
  const topPodcasts = Object.values(podcastMap)
    .sort((a, b) => b.count - a.count)
    .map(p => ({ ...p, pct: totalDownloads > 0 ? ((p.count / totalDownloads) * 100).toFixed(1) : '0.0' }));

  // Merge episodes
  const episodeMap: Record<string, { episode_id: string; podcast_id: string; show: string; count: number; duration: number }> = {};
  for (const day of days) {
    for (const e of day.byEpisode) {
      if (!episodeMap[e.episode_id]) {
        episodeMap[e.episode_id] = { ...e, count: 0 };
      }
      episodeMap[e.episode_id].count += e.count;
    }
  }
  const topEpisodes = Object.values(episodeMap)
    .sort((a, b) => b.count - a.count);

  // Merge hourly
  const hourlyMap: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourlyMap[h] = 0;
  for (const day of days) {
    for (const h of day.hourly) {
      hourlyMap[h.hour] += h.count;
    }
  }
  const hourlyDistribution = Object.entries(hourlyMap)
    .map(([h, c]) => ({ hour: parseInt(h), count: c }))
    .sort((a, b) => a.hour - b.hour);

  // Merge impressionsByType
  const impressionsByType = { pre: 0, mid: 0, post: 0, other: 0 };
  for (const day of days) {
    impressionsByType.pre += day.impressionsByType.pre;
    impressionsByType.mid += day.impressionsByType.mid;
    impressionsByType.post += day.impressionsByType.post;
    impressionsByType.other += day.impressionsByType.other;
  }

  // Merge geo
  const geoMap: Record<string, Record<string, number>> = {};
  for (const day of days) {
    for (const g of day.geoBreakdown) {
      if (!geoMap[g.country]) geoMap[g.country] = {};
      for (const r of g.regions) {
        geoMap[g.country][r.region] = (geoMap[g.country][r.region] || 0) + r.count;
      }
    }
  }
  const geoBreakdown = Object.entries(geoMap)
    .map(([country, regions]) => ({
      country,
      total: Object.values(regions).reduce((a, b) => a + b, 0),
      regions: Object.entries(regions)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.total - a.total);

  const numDays = selectedDates.length || 1;

  return {
    dateRange: {
      start: selectedDates[0] || startDate,
      end: selectedDates[selectedDates.length - 1] || endDate,
      days: selectedDates.length,
    },
    summary: {
      totalDownloads,
      totalImpressions,
      uniqueDownloads: totalUniqueDownloads,
      downloadsWithAds: totalDownloadsWithAds,
      fillRate,
      avgDailyDownloads: Math.round(totalDownloads / numDays),
      avgDailyImpressions: Math.round(totalImpressions / numDays),
      uniquePodcasts: Object.keys(podcastMap).length,
      uniqueEpisodes: Object.keys(episodeMap).length,
      uniqueCountries: byCountry.length,
      uniquePlatforms: byPlatform.length,
    },
    dailyDownloads,
    dailyImpressions,
    byCountry,
    byPlatform,
    byDeviceCategory,
    byDMA,
    topPodcasts,
    topEpisodes,
    hourlyDistribution,
    impressionsByType,
    geoBreakdown,
  };
}
