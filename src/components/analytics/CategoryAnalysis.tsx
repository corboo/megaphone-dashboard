'use client';

import { useState, useMemo } from 'react';

interface Show {
  podcast_id: string;
  title: string;
  category: string;
  count: number;
  pct: string;
}

interface CategoryData {
  name: string;
  shows: number;
  downloads: number;
  avg: number;
  topShows: { title: string; count: number }[];
}

interface Props {
  shows: Show[];
  totalDownloads: number;
}

function computeCategories(shows: Show[]): CategoryData[] {
  const catMap = new Map<string, { downloads: number; showList: { title: string; count: number }[] }>();
  
  for (const show of shows) {
    const cat = show.category || 'Uncategorized';
    const existing = catMap.get(cat);
    if (existing) {
      existing.downloads += show.count;
      existing.showList.push({ title: show.title, count: show.count });
    } else {
      catMap.set(cat, { downloads: show.count, showList: [{ title: show.title, count: show.count }] });
    }
  }

  return Array.from(catMap.entries()).map(([name, data]) => ({
    name,
    shows: data.showList.length,
    downloads: data.downloads,
    avg: data.showList.length > 0 ? Math.round(data.downloads / data.showList.length) : 0,
    topShows: data.showList.sort((a, b) => b.count - a.count).slice(0, 5),
  }));
}

function generateInsights(categories: CategoryData[], totalDownloads: number) {
  const sorted = [...categories].sort((a, b) => b.downloads - a.downloads);
  const sortedByAvg = [...categories].sort((a, b) => b.avg - a.avg);
  const sortedByShows = [...categories].sort((a, b) => b.shows - a.shows);

  // Top 5 by total
  const topByTotal = sorted.slice(0, 5);
  // Top 5 by efficiency (min 5 shows to qualify)
  const topByEfficiency = sortedByAvg.filter(c => c.shows >= 5).slice(0, 5);
  // Bottom by efficiency (min 10 shows to be meaningful)
  const bottomByEfficiency = [...categories].filter(c => c.shows >= 10).sort((a, b) => a.avg - b.avg).slice(0, 3);
  // Biggest by volume (most shows)
  const biggestByVolume = sortedByShows.slice(0, 3);

  // Concentration: what % of downloads do top 3 categories drive?
  const top3Downloads = sorted.slice(0, 3).reduce((s, c) => s + c.downloads, 0);
  const top3Pct = totalDownloads > 0 ? ((top3Downloads / totalDownloads) * 100).toFixed(1) : '0';

  // Total shows
  const totalShows = categories.reduce((s, c) => s + c.shows, 0);

  const working: { title: string; description: string }[] = [];
  const attention: { title: string; description: string }[] = [];

  // What's Working
  if (topByEfficiency.length > 0) {
    const top = topByEfficiency[0];
    working.push({
      title: `${top.name} leads in efficiency`,
      description: `With ${top.avg.toLocaleString()} avg downloads per show across ${top.shows} shows, ${top.name} is the most efficient category. Top show: "${top.topShows[0]?.title}" (${top.topShows[0]?.count.toLocaleString()} downloads).`,
    });
  }

  if (topByTotal.length >= 2) {
    const top2 = topByTotal.slice(0, 2);
    working.push({
      title: `${top2.map(c => c.name).join(' and ')} dominate total downloads`,
      description: `Together they account for ${((top2.reduce((s, c) => s + c.downloads, 0) / totalDownloads) * 100).toFixed(1)}% of all downloads (${top2.map(c => c.downloads.toLocaleString()).join(' + ')} downloads).`,
    });
  }

  // Find categories with high avg and meaningful show count
  const highAvgCategories = sortedByAvg.filter(c => c.shows >= 10 && c.avg > 100);
  if (highAvgCategories.length >= 2) {
    working.push({
      title: `${highAvgCategories.length} categories maintain strong per-show performance`,
      description: `Categories like ${highAvgCategories.slice(0, 3).map(c => `${c.name} (${c.avg} avg)`).join(', ')} show consistent audience engagement with 100+ avg downloads per show.`,
    });
  }

  // Large catalog working at scale
  const largestCat = biggestByVolume[0];
  if (largestCat && largestCat.shows > 100) {
    const catPct = totalDownloads > 0 ? ((largestCat.downloads / totalDownloads) * 100).toFixed(1) : '0';
    working.push({
      title: `${largestCat.name} works at scale`,
      description: `${largestCat.shows.toLocaleString()} shows generating ${largestCat.downloads.toLocaleString()} downloads (${catPct}% of total). The long tail adds up — aggregate volume matters.`,
    });
  }

  // Concentration insight
  working.push({
    title: `Top 3 categories drive ${top3Pct}% of downloads`,
    description: `${sorted.slice(0, 3).map(c => c.name).join(', ')} form the core revenue drivers. Concentration shows clear category-market fit.`,
  });

  // What Needs Attention
  if (bottomByEfficiency.length > 0) {
    for (const cat of bottomByEfficiency) {
      attention.push({
        title: `${cat.name} has low per-show efficiency`,
        description: `${cat.shows} shows averaging only ${cat.avg} downloads each. May need better SEO, differentiation, or content quality improvements.`,
      });
    }
  }

  // Categories with lots of shows but poor total downloads
  const underperformers = categories.filter(c => c.shows >= 20 && c.avg < 20);
  if (underperformers.length > 0) {
    attention.push({
      title: `${underperformers.length} categories have significant catalogs but <20 avg downloads`,
      description: `Categories like ${underperformers.slice(0, 3).map(c => `${c.name} (${c.shows} shows, ${c.avg} avg)`).join(', ')} may be over-saturated or poorly targeted.`,
    });
  }

  // Recommendations
  const recommendations: { title: string; description: string }[] = [];

  if (topByEfficiency.length > 0) {
    recommendations.push({
      title: 'Scale high-efficiency categories',
      description: `Categories like ${topByEfficiency.slice(0, 3).map(c => c.name).join(', ')} show strong per-show performance. Adding more shows in these niches should yield reliable downloads.`,
    });
  }

  recommendations.push({
    title: 'Double down on daily habit formats',
    description: `Recurring content (weather, reports, trackers, horoscopes) builds daily subscriber loops. Each new subscriber compounds over time.`,
  });

  if (largestCat && largestCat.avg < 50) {
    recommendations.push({
      title: `Focus new ${largestCat.name} production on trending subjects`,
      description: `At ${largestCat.avg} avg per show, prioritize subjects with breakout potential rather than deep catalog expansion. The top performers prove trending subjects can 10x the average.`,
    });
  }

  recommendations.push({
    title: 'Expand the "topic × location" playbook',
    description: 'The data proves that replicating a working topic across cities/locations yields reliable daily downloads. AI production can scale this where human producers cannot.',
  });

  recommendations.push({
    title: 'Give the catalog time before pruning',
    description: 'Podcast discovery takes 30-90 days. Shows at 300 downloads in the first weeks could reach 1,000+ as platform algorithms surface them. Set a 60-day checkpoint before making decisions.',
  });

  if (bottomByEfficiency.length > 0) {
    recommendations.push({
      title: 'Improve low-efficiency categories',
      description: `${bottomByEfficiency.map(c => c.name).join(', ')} — consider better titles, SEO optimization, or content differentiation in these competitive spaces.`,
    });
  }

  return { working, attention, recommendations };
}

export default function CategoryAnalysis({ shows, totalDownloads }: Props) {
  const [chartView, setChartView] = useState<'total' | 'efficiency'>('total');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = useMemo(() => computeCategories(shows), [shows]);
  const insights = useMemo(() => generateInsights(categories, totalDownloads), [categories, totalDownloads]);

  const sorted = useMemo(() => {
    return [...categories].sort((a, b) =>
      chartView === 'total' ? b.downloads - a.downloads : b.avg - a.avg
    );
  }, [categories, chartView]);

  // For bar chart - show top 25 categories
  const chartCategories = sorted.slice(0, 25);
  const maxBarVal = chartCategories.length > 0
    ? Math.max(...chartCategories.map(c => chartView === 'total' ? c.downloads : c.avg))
    : 1;

  const totalShows = categories.reduce((s, c) => s + c.shows, 0);
  const totalCats = categories.length;
  const avgPerShow = totalShows > 0 ? Math.round(totalDownloads / totalShows) : 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <h2 className="text-xl font-bold text-white">Category Analysis</h2>
        <div className="flex-1 h-px bg-[#1e1e35]" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-4 hover:border-[#D4A847]/20 transition-colors">
          <div className="text-[#6b6b80] text-xs font-medium mb-2">TOTAL SHOWS</div>
          <div className="text-2xl font-bold text-[#D4A847]">{totalShows.toLocaleString()}</div>
          <div className="text-[#6b6b80] text-xs mt-1">Active on Megaphone</div>
        </div>
        <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-4 hover:border-[#D4A847]/20 transition-colors">
          <div className="text-[#6b6b80] text-xs font-medium mb-2">TOTAL DOWNLOADS</div>
          <div className="text-2xl font-bold text-[#D4A847]">{totalDownloads.toLocaleString()}</div>
          <div className="text-[#6b6b80] text-xs mt-1">All-time across network</div>
        </div>
        <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-4 hover:border-[#D4A847]/20 transition-colors">
          <div className="text-[#6b6b80] text-xs font-medium mb-2">AVG PER SHOW</div>
          <div className="text-2xl font-bold text-[#D4A847]">{avgPerShow.toLocaleString()}</div>
          <div className="text-[#6b6b80] text-xs mt-1">Downloads per show</div>
        </div>
        <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-4 hover:border-[#D4A847]/20 transition-colors">
          <div className="text-[#6b6b80] text-xs font-medium mb-2">CATEGORIES</div>
          <div className="text-2xl font-bold text-[#D4A847]">{totalCats}</div>
          <div className="text-[#6b6b80] text-xs mt-1">Content verticals</div>
        </div>
      </div>

      {/* Power Law Callout */}
      <div className="bg-gradient-to-r from-[#D4A847]/10 to-[#D4A847]/5 border border-[#D4A847]/25 rounded-xl p-5 flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">⚡</span>
        <div className="text-sm leading-relaxed">
          <span className="text-[#D4A847] font-semibold">Power Law Distribution:</span>{' '}
          <span className="text-gray-300">
            The top 3 categories ({sorted.slice(0, 3).map(c => c.name).join(', ')}) drive{' '}
            <span className="text-[#D4A847] font-semibold">
              {totalDownloads > 0
                ? ((sorted.slice(0, 3).reduce((s, c) => s + c.downloads, 0) / totalDownloads) * 100).toFixed(1)
                : '0'}%
            </span>{' '}
            of all downloads. Category selection and content quality matter more than volume.
          </span>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Category Performance</h3>
          <div className="flex bg-[#0a0a18] rounded-lg border border-[#1e1e35] overflow-hidden">
            <button
              onClick={() => setChartView('total')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                chartView === 'total'
                  ? 'bg-[#D4A847] text-black'
                  : 'text-[#6b6b80] hover:text-white'
              }`}
            >
              Total Downloads
            </button>
            <button
              onClick={() => setChartView('efficiency')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                chartView === 'efficiency'
                  ? 'bg-[#D4A847] text-black'
                  : 'text-[#6b6b80] hover:text-white'
              }`}
            >
              Avg per Show
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {chartCategories.map((cat, i) => {
            const val = chartView === 'total' ? cat.downloads : cat.avg;
            const pct = (val / maxBarVal) * 100;
            const isExpanded = expandedCategory === cat.name;

            return (
              <div key={cat.name}>
                <div
                  className="flex items-center gap-3 group cursor-pointer hover:bg-[#1a1a2e] rounded-lg px-2 py-1.5 transition-colors"
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                >
                  <span className={`text-sm font-bold w-6 text-right ${i < 3 ? 'text-[#D4A847]' : 'text-[#3a3a50]'}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300 w-40 truncate flex-shrink-0" title={cat.name}>
                    {cat.name}
                  </span>
                  <div className="flex-1 h-5 bg-[#1e1e35] rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 1)}%`,
                        background: i === 0
                          ? 'linear-gradient(90deg, #D4A847, #e5b85e)'
                          : i < 3
                            ? 'linear-gradient(90deg, #D4A847cc, #D4A847)'
                            : 'linear-gradient(90deg, #D4A84780, #D4A847aa)',
                      }}
                    />
                  </div>
                  <div className="text-right flex-shrink-0 w-24">
                    <span className="text-sm font-semibold text-[#D4A847]">
                      {val.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#6b6b80] ml-1">
                      ({cat.shows} shows)
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#6b6b80] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="ml-9 mr-4 mb-3 mt-1 bg-[#0a0a18] rounded-lg border border-[#1e1e35] p-4">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-[#6b6b80] text-xs mb-1">Total Downloads</div>
                        <div className="text-lg font-bold text-[#D4A847]">{cat.downloads.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[#6b6b80] text-xs mb-1"># of Shows</div>
                        <div className="text-lg font-bold text-white">{cat.shows.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[#6b6b80] text-xs mb-1">Avg / Show</div>
                        <div className="text-lg font-bold text-white">{cat.avg.toLocaleString()}</div>
                      </div>
                    </div>
                    {cat.topShows.length > 0 && (
                      <>
                        <div className="text-[#6b6b80] text-xs font-medium mb-2">TOP SHOWS</div>
                        <div className="space-y-1.5">
                          {cat.topShows.map((show, si) => (
                            <div key={si} className="flex items-center gap-2 text-sm">
                              <span className={`font-bold w-5 text-right ${si < 3 ? 'text-[#D4A847]' : 'text-[#3a3a50]'}`}>{si + 1}</span>
                              <span className="text-gray-300 truncate flex-1">{show.title}</span>
                              <span className="text-[#D4A847] font-mono font-medium">{show.count.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sorted.length > 25 && (
          <div className="mt-3 text-center text-[#6b6b80] text-xs">
            Showing top 25 of {sorted.length} categories
          </div>
        )}
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.slice(0, 12).map((cat, i) => {
          const dlPct = totalDownloads > 0 ? ((cat.downloads / totalDownloads) * 100).toFixed(1) : '0';
          return (
            <div
              key={cat.name}
              className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-4 hover:border-[#D4A847]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${i < 3 ? 'text-[#D4A847]' : 'text-[#3a3a50]'}`}>
                    #{i + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-white">{cat.name}</h4>
                </div>
                {i === 0 && (
                  <span className="text-[10px] font-semibold bg-[#D4A847]/15 text-[#D4A847] px-2 py-0.5 rounded-full">
                    {chartView === 'total' ? 'TOP' : 'MOST EFFICIENT'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <div className="text-[#6b6b80] text-[10px] uppercase">Downloads</div>
                  <div className="text-[#D4A847] font-bold text-sm">{cat.downloads.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[#6b6b80] text-[10px] uppercase">Shows</div>
                  <div className="text-white font-bold text-sm">{cat.shows.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[#6b6b80] text-[10px] uppercase">Avg/Show</div>
                  <div className="text-white font-bold text-sm">{cat.avg.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full h-1.5 bg-[#1e1e35] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#D4A847]"
                    style={{ width: `${Math.min(parseFloat(dlPct) * 3, 100)}%` }}
                  />
                </div>
                <div className="text-[#6b6b80] text-[10px] mt-1">{dlPct}% of total downloads</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategic Insights */}
      <div className="flex items-center gap-3 mt-8">
        <span className="text-2xl">🧠</span>
        <h2 className="text-xl font-bold text-white">Strategic Insights</h2>
        <div className="flex-1 h-px bg-[#1e1e35]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's Working */}
        <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> What&apos;s Working
          </h3>
          <div className="space-y-4">
            {insights.working.map((item, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-[#D4A847] mb-1">{item.title}</h4>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What Needs Attention */}
        <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚠️</span> What Needs Attention
          </h3>
          <div className="space-y-4">
            {insights.attention.map((item, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-[#ef4444] mb-1">{item.title}</h4>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🎯</span> Strategic Recommendations
        </h3>
        <div className="space-y-4">
          {insights.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4A847] text-black text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">{rec.title}</h4>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Shows Table */}
      <TopShowsByCategory shows={shows} categories={sorted} totalDownloads={totalDownloads} />
    </div>
  );
}

/* ---- Top Shows Sub-Component ---- */
function TopShowsByCategory({
  shows,
  categories,
  totalDownloads,
}: {
  shows: Show[];
  categories: CategoryData[];
  totalDownloads: number;
}) {
  const [filterCat, setFilterCat] = useState('all');
  const [sortKey, setSortKey] = useState<'count' | 'title'>('count');
  const [sortAsc, setSortAsc] = useState(false);
  const [showCount, setShowCount] = useState(50);

  const filtered = useMemo(() => {
    let list = filterCat === 'all' ? [...shows] : shows.filter(s => s.category === filterCat);
    list.sort((a, b) => {
      if (sortKey === 'count') return sortAsc ? a.count - b.count : b.count - a.count;
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });
    return list;
  }, [shows, filterCat, sortKey, sortAsc]);

  const visible = filtered.slice(0, showCount);
  const maxCount = filtered.length > 0 ? filtered[0].count : 1;

  const toggleSort = (key: 'count' | 'title') => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Top Shows by Downloads</h3>
          <p className="text-[#6b6b80] text-sm">
            {filtered.length.toLocaleString()} shows
            {filterCat !== 'all' ? ` in ${filterCat}` : ''}
          </p>
        </div>
        <select
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setShowCount(50); }}
          className="bg-[#0a0a18] border border-[#1e1e35] rounded-lg text-sm text-gray-300 px-3 py-2 focus:outline-none focus:border-[#D4A847]/50"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.name} value={c.name}>{c.name} ({c.shows})</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#1e1e35] bg-[#12121f]">
              <th className="text-left p-2 text-[#6b6b80] font-medium w-10">#</th>
              <th
                className="text-left p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('title')}
              >
                Show {sortKey === 'title' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="text-left p-2 text-[#6b6b80] font-medium">Category</th>
              <th
                className="text-right p-2 text-[#6b6b80] font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('count')}
              >
                Downloads {sortKey === 'count' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="text-right p-2 text-[#6b6b80] font-medium w-16">Share</th>
              <th className="p-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((show, i) => {
              const pct = totalDownloads > 0 ? ((show.count / totalDownloads) * 100).toFixed(2) : '0';
              return (
                <tr
                  key={show.podcast_id}
                  className="border-b border-[#1e1e35]/50 hover:bg-[#1a1a2e] transition-colors"
                >
                  <td className="p-2 text-[#6b6b80] w-10">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                      i < 3 ? 'bg-[#D4A847]/20 text-[#D4A847]' : 'bg-[#1e1e35] text-[#6b6b80]'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="p-2 font-medium max-w-[280px] truncate text-gray-200" title={show.title}>
                    {show.title}
                  </td>
                  <td className="p-2">
                    <span className="bg-[#1e1e35] text-[#3B82F6] text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                      {show.category}
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono text-[#D4A847] font-medium">
                    {show.count.toLocaleString()}
                  </td>
                  <td className="p-2 text-right font-mono text-[#6b6b80] w-16 text-xs">
                    {pct}%
                  </td>
                  <td className="p-2 w-32">
                    <div className="w-full h-1.5 bg-[#1e1e35] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D4A847]"
                        style={{ width: `${(show.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > showCount && (
        <div className="flex justify-center pt-3">
          <button
            onClick={() => setShowCount(s => Math.min(s + 50, filtered.length))}
            className="text-sm text-[#D4A847] hover:text-[#c49a3f] transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-[#D4A847]/5"
          >
            Showing {showCount} of {filtered.length.toLocaleString()} — Show More
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      {showCount > 50 && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowCount(50)}
            className="text-sm text-[#6b6b80] hover:text-white transition-colors px-4 py-1 rounded-lg"
          >
            Show Less
          </button>
        </div>
      )}
    </div>
  );
}
