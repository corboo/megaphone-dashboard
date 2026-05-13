#!/usr/bin/env node

/**
 * Megaphone Analytics Fetcher
 * Fetches metrics (downloads) and impression data from Megaphone's /metrics endpoint.
 * Downloads gzipped JSON files, aggregates into summary data for the dashboard.
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

function aggregateData(metricsRecords, impressionRecords, podcastMap) {
  console.log('\n📊 Aggregating analytics data...');

  const allMetrics = metricsRecords.flat();
  const allImpressions = impressionRecords.flat();

  console.log(`   Total download events: ${allMetrics.length}`);
  console.log(`   Total impression events: ${allImpressions.length}`);

  // 1. Daily download totals
  const dailyDownloads = {};
  allMetrics.forEach(r => {
    const date = r.created_at ? r.created_at.split('T')[0] : 'unknown';
    dailyDownloads[date] = (dailyDownloads[date] || 0) + 1;
  });
  const dailyDownloadsArr = Object.entries(dailyDownloads)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 2. Downloads by country
  const byCountry = {};
  allMetrics.forEach(r => {
    const c = r.country || 'Unknown';
    byCountry[c] = (byCountry[c] || 0) + 1;
  });
  const byCountryArr = Object.entries(byCountry)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // 3. Downloads by platform (normalized_user_agent)
  const byPlatform = {};
  allMetrics.forEach(r => {
    const p = r.normalized_user_agent || 'Unknown';
    byPlatform[p] = (byPlatform[p] || 0) + 1;
  });
  const byPlatformArr = Object.entries(byPlatform)
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);

  // 4. Downloads by device type
  const byDevice = {};
  allMetrics.forEach(r => {
    const d = parseDeviceType(r.user_agent);
    byDevice[d] = (byDevice[d] || 0) + 1;
  });
  const byDeviceArr = Object.entries(byDevice)
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  // 5. Downloads by device category (simplified)
  const byDeviceCategory = {};
  allMetrics.forEach(r => {
    const d = parseDeviceCategory(r.user_agent);
    byDeviceCategory[d] = (byDeviceCategory[d] || 0) + 1;
  });
  const byDeviceCategoryArr = Object.entries(byDeviceCategory)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // 6. Downloads by DMA (top 20 US markets)
  const byDMA = {};
  allMetrics.forEach(r => {
    if (r.dma_name && r.dma_name.length > 0) {
      byDMA[r.dma_name] = (byDMA[r.dma_name] || 0) + 1;
    }
  });
  const byDMAArr = Object.entries(byDMA)
    .map(([dma, count]) => ({ dma, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // 7. Top podcasts by downloads
  const byPodcast = {};
  allMetrics.forEach(r => {
    const pid = r.podcast_id || 'unknown';
    if (!byPodcast[pid]) {
      const info = podcastMap[pid] || {};
      byPodcast[pid] = {
        podcast_id: pid,
        title: info.title || pid,
        category: info.category || 'Unknown',
        count: 0,
      };
    }
    byPodcast[pid].count++;
  });
  const totalDownloads = allMetrics.length;
  const byPodcastArr = Object.values(byPodcast)
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
    .map(p => ({
      ...p,
      pct: totalDownloads > 0 ? ((p.count / totalDownloads) * 100).toFixed(1) : '0.0',
    }));

  // 8. Top episodes by downloads
  const byEpisode = {};
  allMetrics.forEach(r => {
    const eid = r.episode_id || 'unknown';
    if (!byEpisode[eid]) {
      const podInfo = podcastMap[r.podcast_id] || {};
      byEpisode[eid] = {
        episode_id: eid,
        podcast_id: r.podcast_id,
        show: podInfo.title || r.podcast_id,
        count: 0,
        duration: r.duration || 0,
      };
    }
    byEpisode[eid].count++;
  });
  const byEpisodeArr = Object.values(byEpisode)
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  // 9. Hourly distribution
  const byHour = {};
  for (let h = 0; h < 24; h++) byHour[h] = 0;
  allMetrics.forEach(r => {
    if (r.created_at) {
      const hour = new Date(r.created_at).getUTCHours();
      byHour[hour]++;
    }
  });
  const byHourArr = Object.entries(byHour)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  // 10. Ad impressions by type
  const impByType = { pre: 0, mid: 0, post: 0, other: 0 };
  allImpressions.forEach(r => {
    const t = (r.type || '').toLowerCase();
    if (t === 'pre') impByType.pre++;
    else if (t === 'mid') impByType.mid++;
    else if (t === 'post') impByType.post++;
    else impByType.other++;
  });

  // 11. Daily impressions
  const dailyImpressions = {};
  allImpressions.forEach(r => {
    const date = r.created_at ? r.created_at.split('T')[0] : 'unknown';
    dailyImpressions[date] = (dailyImpressions[date] || 0) + 1;
  });
  const dailyImpressionsArr = Object.entries(dailyImpressions)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 12. Ad fill rate (unique downloads that had at least one impression)
  const downloadIds = new Set(allMetrics.map(r => r.id));
  const impressionMetricIds = new Set(allImpressions.map(r => r.metric_id));
  const downloadsWithAds = [...downloadIds].filter(id => impressionMetricIds.has(id)).length;
  const fillRate = downloadIds.size > 0 ? ((downloadsWithAds / downloadIds.size) * 100).toFixed(1) : '0.0';

  // 13. Geographic breakdown: country -> region
  const geoBreakdown = {};
  allMetrics.forEach(r => {
    const c = r.country || 'Unknown';
    const reg = r.region || 'Unknown';
    if (!geoBreakdown[c]) geoBreakdown[c] = {};
    geoBreakdown[c][reg] = (geoBreakdown[c][reg] || 0) + 1;
  });
  // Top 10 countries with top 10 regions each
  const geoArr = Object.entries(geoBreakdown)
    .map(([country, regions]) => ({
      country,
      total: Object.values(regions).reduce((a, b) => a + b, 0),
      regions: Object.entries(regions)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  // 14. Impressions by ad source
  const impBySource = {};
  allImpressions.forEach(r => {
    const src = r.ad_source || 'unknown';
    impBySource[src] = (impBySource[src] || 0) + 1;
  });

  // 15. Daily downloads + impressions combined for date range
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
      uniquePodcasts: Object.keys(byPodcast).length,
      uniqueEpisodes: Object.keys(byEpisode).length,
      uniqueCountries: Object.keys(byCountry).length,
      uniquePlatforms: Object.keys(byPlatform).length,
    },
    dailyDownloads: dailyDownloadsArr,
    dailyImpressions: dailyImpressionsArr,
    byCountry: byCountryArr,
    byPlatform: byPlatformArr,
    byDevice: byDeviceArr,
    byDeviceCategory: byDeviceCategoryArr,
    byDMA: byDMAArr,
    topPodcasts: byPodcastArr,
    topEpisodes: byEpisodeArr,
    hourlyDistribution: byHourArr,
    impressionsByType: impByType,
    impressionsBySource: impBySource,
    geoBreakdown: geoArr,
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

  // Download all metrics files
  console.log('📥 Downloading metrics files...');
  const metricsRecords = [];
  for (const f of metricsFiles) {
    const records = await downloadAndDecompress(f.url, f.filename);
    metricsRecords.push(records);
  }

  // Download all impression files
  console.log('\n📥 Downloading impression files...');
  const impressionRecords = [];
  for (const f of impressionFiles) {
    const records = await downloadAndDecompress(f.url, f.filename);
    impressionRecords.push(records);
  }

  // Aggregate
  const analytics = aggregateData(metricsRecords, impressionRecords, podcastMap);

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
  console.log(`   Completed in ${elapsed}s`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
