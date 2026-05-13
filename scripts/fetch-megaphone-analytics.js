#!/usr/bin/env node

/**
 * Megaphone Analytics Fetcher
 * Fetches metrics (downloads) and impression data from Megaphone's /metrics endpoint.
 * Downloads gzipped JSON files, aggregates into summary data for the dashboard.
 * 
 * Now saves per-day breakdowns (byDay) so the frontend can do client-side date filtering.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SECRETS_PATH = path.join(process.env.HOME, '.secrets', 'megaphone.json');
const secrets = JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf-8'));

const API_TOKEN = secrets.api_token;
const ORG_ID = secrets.organization_id;
const BASE_URL = secrets.base_url;

const HEADERS = {
  'Authorization': `Token token="${API_TOKEN}"`,
  'Accept': 'application/json',
};

// Load existing megaphone-data.json for podcast_id -> title mapping
function loadPodcastMapping() {
  const dataPath = path.join(__dirname, '..', 'data', 'megaphone-data.json');
  if (!fs.existsSync(dataPath)) {
    console.warn('⚠️  megaphone-data.json not found, podcast names will use IDs');
    return {};
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const map = {};
  if (data.allPodcasts) {
    data.allPodcasts.forEach(p => {
      map[p.id] = { title: p.title, category: p.category };
    });
  }
  return map;
}

// Parse device type from user_agent string
function parseDeviceType(ua) {
  if (!ua) return 'Unknown';
  const lower = ua.toLowerCase();
  if (lower.includes('iphone')) return 'iPhone';
  if (lower.includes('ipad')) return 'iPad';
  if (lower.includes('android')) return 'Android';
  if (lower.includes('windows')) return 'Windows';
  if (lower.includes('macintosh') || lower.includes('mac os')) return 'Mac';
  if (lower.includes('linux') && !lower.includes('android')) return 'Linux';
  if (lower.includes('darwin')) return 'Apple (Other)';
  if (lower.includes('alexa') || lower.includes('echo')) return 'Smart Speaker';
  if (lower.includes('sonos')) return 'Smart Speaker';
  if (lower.includes('googlehome')) return 'Smart Speaker';
  if (lower.includes('bot') || lower.includes('crawler')) return 'Bot';
  return 'Other';
}

// Parse device OS category for simpler grouping
function parseDeviceCategory(ua) {
  if (!ua) return 'Other';
  const lower = ua.toLowerCase();
  if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('darwin') || lower.includes('mac os')) return 'iOS/macOS';
  if (lower.includes('android')) return 'Android';
  if (lower.includes('windows')) return 'Windows';
  if (lower.includes('linux') && !lower.includes('android')) return 'Linux';
  if (lower.includes('alexa') || lower.includes('echo') || lower.includes('sonos') || lower.includes('googlehome')) return 'Smart Speaker';
  return 'Other';
}

async function fetchMetricsIndex() {
  console.log('📡 Fetching metrics index from Megaphone...');
  const url = `${BASE_URL}/organizations/${ORG_ID}/metrics`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function downloadAndDecompress(url, filename) {
  console.log(`   📥 Downloading ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} downloading ${filename}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const decompressed = zlib.gunzipSync(buf);
  const text = decompressed.toString('utf-8');
  const lines = text.trim().split('\n').filter(l => l.length > 0);
  const records = lines.map(line => JSON.parse(line));
  console.log(`      → ${records.length} records`);
  return records;
}

/** Helper: increment a counter in a nested map */
function inc(obj, key) {
  obj[key] = (obj[key] || 0) + 1;
}

/** Aggregate a flat list of metric records into dimension maps */
function aggregateRecords(records, podcastMap) {
  const byCountry = {};
  const byPlatform = {};
  const byDevice = {};
  const byDeviceCategory = {};
  const byDMA = {};
  const byPodcast = {};
  const byEpisode = {};
  const byHour = {};
  for (let h = 0; h < 24; h++) byHour[h] = 0;
  const geoRaw = {}; // country -> region -> count

  for (const r of records) {
    // Country
    inc(byCountry, r.country || 'Unknown');

    // Platform
    inc(byPlatform, r.normalized_user_agent || 'Unknown');

    // Device
    inc(byDevice, parseDeviceType(r.user_agent));

    // Device category
    inc(byDeviceCategory, parseDeviceCategory(r.user_agent));

    // DMA
    if (r.dma_name && r.dma_name.length > 0) {
      inc(byDMA, r.dma_name);
    }

    // Podcast
    const pid = r.podcast_id || 'unknown';
    if (!byPodcast[pid]) {
      const info = podcastMap[pid] || {};
      byPodcast[pid] = { podcast_id: pid, title: info.title || pid, category: info.category || 'Unknown', count: 0 };
    }
    byPodcast[pid].count++;

    // Episode
    const eid = r.episode_id || 'unknown';
    if (!byEpisode[eid]) {
      const podInfo = podcastMap[r.podcast_id] || {};
      byEpisode[eid] = { episode_id: eid, podcast_id: r.podcast_id, show: podInfo.title || r.podcast_id, count: 0, duration: r.duration || 0 };
    }
    byEpisode[eid].count++;

    // Hour
    if (r.created_at) {
      const hour = new Date(r.created_at).getUTCHours();
      byHour[hour]++;
    }

    // Geo: country -> region
    const c = r.country || 'Unknown';
    const reg = r.region || 'Unknown';
    if (!geoRaw[c]) geoRaw[c] = {};
    inc(geoRaw[c], reg);
  }

  // Convert to sorted arrays
  const totalDownloads = records.length;

  const toSortedArr = (obj, keyName) =>
    Object.entries(obj)
      .map(([k, v]) => ({ [keyName]: k, count: v }))
      .sort((a, b) => b.count - a.count);

  const topPodcasts = Object.values(byPodcast)
    .sort((a, b) => b.count - a.count)
    .map(p => ({ ...p, pct: totalDownloads > 0 ? ((p.count / totalDownloads) * 100).toFixed(1) : '0.0' }));

  const topEpisodes = Object.values(byEpisode)
    .sort((a, b) => b.count - a.count);

  const hourlyDistribution = Object.entries(byHour)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  // Geo breakdown: all countries with all regions
  const geoBreakdown = Object.entries(geoRaw)
    .map(([country, regions]) => ({
      country,
      total: Object.values(regions).reduce((a, b) => a + b, 0),
      regions: Object.entries(regions)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.total - a.total);

  return {
    byCountry: toSortedArr(byCountry, 'country'),
    byPlatform: toSortedArr(byPlatform, 'platform'),
    byDevice: toSortedArr(byDevice, 'device'),
    byDeviceCategory: toSortedArr(byDeviceCategory, 'category'),
    byDMA: toSortedArr(byDMA, 'dma'),
    topPodcasts,
    topEpisodes,
    hourlyDistribution,
    geoBreakdown,
  };
}

function aggregateData(metricsRecordsByDay, impressionRecordsByDay, podcastMap) {
  console.log('\n📊 Aggregating analytics data...');

  // Flatten all
  const allMetrics = metricsRecordsByDay.flatMap(d => d.records);
  const allImpressions = impressionRecordsByDay.flatMap(d => d.records);

  console.log(`   Total download events: ${allMetrics.length}`);
  console.log(`   Total impression events: ${allImpressions.length}`);

  // === TOTALS (same as before, but NO slicing — keep all data) ===
  const totalsAgg = aggregateRecords(allMetrics, podcastMap);
  const totalDownloads = allMetrics.length;

  // Daily download totals
  const dailyDownloads = {};
  allMetrics.forEach(r => {
    const date = r.created_at ? r.created_at.split('T')[0] : 'unknown';
    dailyDownloads[date] = (dailyDownloads[date] || 0) + 1;
  });
  const dailyDownloadsArr = Object.entries(dailyDownloads)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Daily impressions
  const dailyImpressions = {};
  allImpressions.forEach(r => {
    const date = r.created_at ? r.created_at.split('T')[0] : 'unknown';
    dailyImpressions[date] = (dailyImpressions[date] || 0) + 1;
  });
  const dailyImpressionsArr = Object.entries(dailyImpressions)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Ad impressions by type
  const impByType = { pre: 0, mid: 0, post: 0, other: 0 };
  allImpressions.forEach(r => {
    const t = (r.type || '').toLowerCase();
    if (t === 'pre') impByType.pre++;
    else if (t === 'mid') impByType.mid++;
    else if (t === 'post') impByType.post++;
    else impByType.other++;
  });

  // Ad fill rate
  const downloadIds = new Set(allMetrics.map(r => r.id));
  const impressionMetricIds = new Set(allImpressions.map(r => r.metric_id));
  const downloadsWithAds = [...downloadIds].filter(id => impressionMetricIds.has(id)).length;
  const fillRate = downloadIds.size > 0 ? ((downloadsWithAds / downloadIds.size) * 100).toFixed(1) : '0.0';

  // Impressions by source
  const impBySource = {};
  allImpressions.forEach(r => {
    const src = r.ad_source || 'unknown';
    impBySource[src] = (impBySource[src] || 0) + 1;
  });

  // Date range
  const allDates = new Set([
    ...Object.keys(dailyDownloads),
    ...Object.keys(dailyImpressions),
  ]);
  const sortedDates = [...allDates].sort();
  const dateRange = {
    start: sortedDates[0] || 'N/A',
    end: sortedDates[sortedDates.length - 1] || 'N/A',
    days: sortedDates.length,
  };

  // === PER-DAY BREAKDOWNS ===
  console.log('\n📅 Building per-day breakdowns...');

  // Group metrics records by date
  const metricsByDate = {};
  for (const r of allMetrics) {
    const date = r.created_at ? r.created_at.split('T')[0] : 'unknown';
    if (!metricsByDate[date]) metricsByDate[date] = [];
    metricsByDate[date].push(r);
  }

  // Group impressions by date
  const impressionsByDate = {};
  for (const r of allImpressions) {
    const date = r.created_at ? r.created_at.split('T')[0] : 'unknown';
    if (!impressionsByDate[date]) impressionsByDate[date] = [];
    impressionsByDate[date].push(r);
  }

  const byDay = {};
  for (const date of sortedDates) {
    const dayMetrics = metricsByDate[date] || [];
    const dayImpressions = impressionsByDate[date] || [];
    const dayAgg = aggregateRecords(dayMetrics, podcastMap);

    // Per-day impression breakdown
    const dayImpByType = { pre: 0, mid: 0, post: 0, other: 0 };
    dayImpressions.forEach(r => {
      const t = (r.type || '').toLowerCase();
      if (t === 'pre') dayImpByType.pre++;
      else if (t === 'mid') dayImpByType.mid++;
      else if (t === 'post') dayImpByType.post++;
      else dayImpByType.other++;
    });

    // Per-day fill rate
    const dayDownloadIds = new Set(dayMetrics.map(r => r.id));
    const dayImpMetricIds = new Set(dayImpressions.map(r => r.metric_id));
    const dayDownloadsWithAds = [...dayDownloadIds].filter(id => dayImpMetricIds.has(id)).length;
    const dayFillRate = dayDownloadIds.size > 0 ? ((dayDownloadsWithAds / dayDownloadIds.size) * 100).toFixed(1) : '0.0';

    // Limit per-day arrays to keep JSON size manageable
    // Top 200 per dimension is enough for client-side merge/re-rank
    byDay[date] = {
      downloads: dayMetrics.length,
      impressions: dayImpressions.length,
      byCountry: dayAgg.byCountry.slice(0, 200),
      byPlatform: dayAgg.byPlatform,
      byDevice: dayAgg.byDevice,
      byDeviceCategory: dayAgg.byDeviceCategory,
      byDMA: dayAgg.byDMA.slice(0, 200),
      topPodcasts: dayAgg.topPodcasts.slice(0, 200),
      topEpisodes: dayAgg.topEpisodes.slice(0, 200),
      hourlyDistribution: dayAgg.hourlyDistribution,
      geoBreakdown: dayAgg.geoBreakdown.slice(0, 50),
      impressionsByType: dayImpByType,
      fillRate: parseFloat(dayFillRate),
      downloadsWithAds: dayDownloadsWithAds,
      uniquePodcasts: dayAgg.topPodcasts.length,
      uniqueEpisodes: dayAgg.topEpisodes.length,
      uniqueCountries: dayAgg.byCountry.length,
      uniquePlatforms: dayAgg.byPlatform.length,
    };
    console.log(`   ${date}: ${dayMetrics.length} downloads, ${dayImpressions.length} impressions`);
  }

  return {
    generatedAt: new Date().toISOString(),
    dateRange,
    summary: {
      totalDownloads,
      totalImpressions: allImpressions.length,
      uniqueDownloads: downloadIds.size,
      downloadsWithAds,
      fillRate: parseFloat(fillRate),
      avgDailyDownloads: dailyDownloadsArr.length > 0
        ? Math.round(totalDownloads / dailyDownloadsArr.length)
        : 0,
      avgDailyImpressions: dailyImpressionsArr.length > 0
        ? Math.round(allImpressions.length / dailyImpressionsArr.length)
        : 0,
      uniquePodcasts: Object.keys(
        Object.fromEntries(allMetrics.map(r => [r.podcast_id, 1]))
      ).length,
      uniqueEpisodes: Object.keys(
        Object.fromEntries(allMetrics.map(r => [r.episode_id, 1]))
      ).length,
      uniqueCountries: totalsAgg.byCountry.length,
      uniquePlatforms: totalsAgg.byPlatform.length,
    },
    dailyDownloads: dailyDownloadsArr,
    dailyImpressions: dailyImpressionsArr,
    // Full totals — keep generous limits for expandable lists
    byCountry: totalsAgg.byCountry,
    byPlatform: totalsAgg.byPlatform,
    byDevice: totalsAgg.byDevice,
    byDeviceCategory: totalsAgg.byDeviceCategory,
    byDMA: totalsAgg.byDMA,
    topPodcasts: totalsAgg.topPodcasts, // all 1273
    topEpisodes: totalsAgg.topEpisodes.slice(0, 500), // top 500 episodes
    hourlyDistribution: totalsAgg.hourlyDistribution,
    impressionsByType: impByType,
    impressionsBySource: impBySource,
    geoBreakdown: totalsAgg.geoBreakdown,
    // NEW: per-day breakdowns for client-side filtering
    byDay,
  };
}

async function main() {
  const startTime = Date.now();

  // Load podcast mapping
  const podcastMap = loadPodcastMapping();
  console.log(`📚 Loaded ${Object.keys(podcastMap).length} podcast title mappings\n`);

  // Fetch metrics index
  const files = await fetchMetricsIndex();
  console.log(`   Found ${files.length} data files\n`);

  const metricsFiles = files.filter(f => f.type === 'metrics').sort((a, b) => a.date.localeCompare(b.date));
  const impressionFiles = files.filter(f => f.type === 'impression').sort((a, b) => a.date.localeCompare(b.date));

  console.log(`📈 Metrics files (${metricsFiles.length}):`);
  metricsFiles.forEach(f => console.log(`   - ${f.date}`));
  console.log(`\n📢 Impression files (${impressionFiles.length}):`);
  impressionFiles.forEach(f => console.log(`   - ${f.date}`));
  console.log('');

  // Download all metrics files (keep track of which date each came from)
  console.log('📥 Downloading metrics files...');
  const metricsRecordsByDay = [];
  for (const f of metricsFiles) {
    const records = await downloadAndDecompress(f.url, f.filename);
    metricsRecordsByDay.push({ date: f.date, records });
  }

  // Download all impression files
  console.log('\n📥 Downloading impression files...');
  const impressionRecordsByDay = [];
  for (const f of impressionFiles) {
    const records = await downloadAndDecompress(f.url, f.filename);
    impressionRecordsByDay.push({ date: f.date, records });
  }

  // Aggregate
  const analytics = aggregateData(metricsRecordsByDay, impressionRecordsByDay, podcastMap);

  // Save
  const outPath = path.join(__dirname, '..', 'data', 'megaphone-analytics.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(analytics, null, 2));

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n✅ Analytics data saved to ${outPath}`);
  console.log(`   ${analytics.summary.totalDownloads} downloads, ${analytics.summary.totalImpressions} impressions`);
  console.log(`   ${analytics.summary.uniquePodcasts} podcasts, ${analytics.summary.uniqueEpisodes} episodes`);
  console.log(`   ${analytics.summary.uniqueCountries} countries, ${analytics.summary.uniquePlatforms} platforms`);
  console.log(`   Fill rate: ${analytics.summary.fillRate}%`);
  console.log(`   Per-day data: ${Object.keys(analytics.byDay).length} days`);
  console.log(`   Completed in ${elapsed}s`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
