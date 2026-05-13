#!/usr/bin/env node

/**
 * Megaphone Data Fetcher
 * Paginates through all podcasts, fetches first page of episodes for top 50 shows.
 * Respects rate limit: 1 req/sec.
 */

const fs = require('fs');
const path = require('path');

const SECRETS_PATH = path.join(process.env.HOME, '.secrets', 'megaphone.json');
const secrets = JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf-8'));

const API_TOKEN = secrets.api_token;
const NETWORK_ID = secrets.network_id;
const BASE_URL = secrets.base_url;

const HEADERS = {
  'Authorization': `Token token="${API_TOKEN}"`,
  'Accept': 'application/json',
};

const PER_PAGE = 500;
const DELAY_MS = 1100;
const TOP_N = 20;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  const total = res.headers.get('x-total');
  const data = await res.json();
  return { data, total: total ? parseInt(total) : null };
}

async function fetchAllPodcasts() {
  const allPodcasts = [];
  let page = 1;
  let total = null;

  console.log('📡 Fetching all podcasts from Megaphone network...');

  while (true) {
    const url = `${BASE_URL}/networks/${NETWORK_ID}/podcasts?per_page=${PER_PAGE}&page=${page}`;
    const { data, total: t } = await fetchJSON(url);

    if (page === 1 && t) {
      total = t;
      console.log(`   Total podcasts reported: ${total}`);
    }

    if (!Array.isArray(data) || data.length === 0) break;

    allPodcasts.push(...data);
    const pct = total ? ((allPodcasts.length / total) * 100).toFixed(1) : '?';
    console.log(`   Page ${page}: got ${data.length} (total: ${allPodcasts.length}/${total || '?'} — ${pct}%)`);

    if (data.length < PER_PAGE) break;
    page++;
    await sleep(DELAY_MS);
  }

  console.log(`✅ Fetched ${allPodcasts.length} podcasts total.\n`);
  return allPodcasts;
}

async function fetchFirstPageEpisodes(podcastId, podcastTitle) {
  // Fetch 100 episodes per show — enough for duration/ad analysis, fast response
  const url = `${BASE_URL}/networks/${NETWORK_ID}/podcasts/${podcastId}/episodes?per_page=100&page=1`;
  try {
    const { data } = await fetchJSON(url);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn(`   ⚠️  Error fetching episodes for "${podcastTitle}": ${e.message}`);
    return [];
  }
}

function computeStats(podcasts, topEpisodes) {
  const totalEpisodes = podcasts.reduce((sum, p) => sum + (p.episodesCount || 0), 0);
  const avgEpisodesPerShow = podcasts.length > 0 ? Math.round(totalEpisodes / podcasts.length) : 0;

  // Categories from itunesCategories array
  const categoryMap = {};
  podcasts.forEach((p) => {
    const cats = p.itunesCategories || [];
    if (cats.length === 0) {
      categoryMap['Uncategorized'] = (categoryMap['Uncategorized'] || 0) + 1;
    } else {
      cats.forEach((cat) => {
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
    }
  });
  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Languages
  const langMap = {};
  podcasts.forEach((p) => {
    const lang = p.language || 'unknown';
    langMap[lang] = (langMap[lang] || 0) + 1;
  });
  const languages = Object.entries(langMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Catalog growth by month
  const growthMap = {};
  podcasts.forEach((p) => {
    if (p.createdAt) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      growthMap[key] = (growthMap[key] || 0) + 1;
    }
  });
  const catalogGrowth = Object.entries(growthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Feed health
  let withSpotifyId = 0, withItunesId = 0, withFeedUrl = 0, withGoogleId = 0, withIheartId = 0;
  podcasts.forEach((p) => {
    if (p.spotifyIdentifier) withSpotifyId++;
    if (p.itunesIdentifier) withItunesId++;
    if (p.feedUrl) withFeedUrl++;
    if (p.googlePodcastsIdentifier || p.googlePlayIdentifier) withGoogleId++;
    if (p.iheartIdentifier) withIheartId++;
  });

  // Episode duration analysis
  const durationBuckets = {
    '0-5 min': 0,
    '5-15 min': 0,
    '15-30 min': 0,
    '30-60 min': 0,
    '60-90 min': 0,
    '90-120 min': 0,
    '120+ min': 0,
  };

  let totalAnalyzedEpisodes = 0;
  let withAdSlots = 0;
  let withoutAdSlots = 0;
  let totalPreSlots = 0;
  let totalPostSlots = 0;
  let totalMidSlots = 0;

  const allEpisodes = Object.values(topEpisodes).flat();
  allEpisodes.forEach((ep) => {
    const durSec = parseFloat(ep.duration) || 0;
    const mins = durSec / 60;
    totalAnalyzedEpisodes++;

    if (mins <= 5) durationBuckets['0-5 min']++;
    else if (mins <= 15) durationBuckets['5-15 min']++;
    else if (mins <= 30) durationBuckets['15-30 min']++;
    else if (mins <= 60) durationBuckets['30-60 min']++;
    else if (mins <= 90) durationBuckets['60-90 min']++;
    else if (mins <= 120) durationBuckets['90-120 min']++;
    else durationBuckets['120+ min']++;

    const pre = ep.preCount || 0;
    const post = ep.postCount || 0;
    const mid = (ep.insertionPoints && ep.insertionPoints.length) || 0;
    totalPreSlots += pre;
    totalPostSlots += post;
    totalMidSlots += mid;

    if (pre > 0 || post > 0 || mid > 0) withAdSlots++;
    else withoutAdSlots++;
  });

  const durationDistribution = Object.entries(durationBuckets)
    .map(([range, count]) => ({ range, count }));

  // Recent activity
  const recentlyCreated = [...podcasts]
    .filter((p) => p.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      title: p.title,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      episodesCount: p.episodesCount || 0,
      category: (p.itunesCategories || [])[0] || 'Uncategorized',
    }));

  const recentlyUpdated = [...podcasts]
    .filter((p) => p.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      title: p.title,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      episodesCount: p.episodesCount || 0,
      category: (p.itunesCategories || [])[0] || 'Uncategorized',
    }));

  return {
    totalPodcasts: podcasts.length,
    totalEpisodes,
    avgEpisodesPerShow,
    totalCategories: categories.length,
    categories,
    languages,
    catalogGrowth,
    feedHealth: {
      withSpotifyId,
      withItunesId,
      withFeedUrl,
      withGoogleId,
      withIheartId,
      total: podcasts.length,
    },
    durationDistribution,
    totalAnalyzedEpisodes,
    adInventory: {
      withAdSlots,
      withoutAdSlots,
      totalAnalyzed: withAdSlots + withoutAdSlots,
      totalPreSlots,
      totalPostSlots,
      totalMidSlots,
    },
    recentlyCreated,
    recentlyUpdated,
  };
}

async function main() {
  const startTime = Date.now();

  // Step 1: Fetch all podcasts
  const podcasts = await fetchAllPodcasts();

  // Step 2: Sort by episode count and get top 50
  const sorted = [...podcasts].sort((a, b) => (b.episodesCount || 0) - (a.episodesCount || 0));
  const top50 = sorted.slice(0, TOP_N);

  console.log(`🎙️  Fetching episodes for top ${TOP_N} shows (first page each)...`);
  const topEpisodes = {};

  for (let i = 0; i < top50.length; i++) {
    const p = top50[i];
    console.log(`   [${i + 1}/${TOP_N}] "${p.title}" (${p.episodesCount || 0} eps)...`);
    const episodes = await fetchFirstPageEpisodes(p.id, p.title);
    topEpisodes[p.id] = episodes;
    console.log(`      → fetched ${episodes.length}`);
    await sleep(DELAY_MS);
  }

  // Step 3: Compute stats
  console.log('\n📊 Computing statistics...');
  const stats = computeStats(podcasts, topEpisodes);

  // Step 4: Build top shows table
  const topShows = top50.map((p) => ({
    id: p.id,
    title: p.title,
    episodesCount: p.episodesCount || 0,
    category: (p.itunesCategories || [])[0] || 'Uncategorized',
    language: p.language || 'unknown',
    createdAt: p.createdAt,
    feedUrl: p.feedUrl || null,
    author: p.author || '',
  }));

  // Step 5: Save
  const output = {
    fetchedAt: new Date().toISOString(),
    fetchDurationSec: Math.round((Date.now() - startTime) / 1000),
    stats,
    topShows,
    allPodcasts: podcasts.map((p) => ({
      id: p.id,
      title: p.title,
      episodesCount: p.episodesCount || 0,
      category: (p.itunesCategories || [])[0] || 'Uncategorized',
      itunesCategories: p.itunesCategories || [],
      language: p.language || 'unknown',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      feedUrl: p.feedUrl || null,
      author: p.author || '',
      explicit: p.explicit || false,
      podcastType: p.podcastType || 'unknown',
      spotifyIdentifier: p.spotifyIdentifier || null,
      itunesIdentifier: p.itunesIdentifier || null,
    })),
  };

  const outPath = path.join(__dirname, '..', 'data', 'megaphone-data.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n✅ Done! Data saved to ${outPath}`);
  console.log(`   ${stats.totalPodcasts} podcasts, ${stats.totalEpisodes} total episodes`);
  console.log(`   ${stats.totalCategories} categories, ${stats.languages.length} languages`);
  console.log(`   Fetch took ${elapsed}s (${Math.round(elapsed / 60)} min)`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
