'use client';

interface FeedHealthData {
  withSpotifyId: number;
  withItunesId: number;
  withFeedUrl: number;
  withGoogleId: number;
  withIheartId: number;
  total: number;
}

function HealthBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#e4e6f0]">{label}</span>
        <span className="text-[#8b90a5]">
          {value.toLocaleString()} / {total.toLocaleString()} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-3 bg-[#2a2f45] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function FeedHealth({ data }: { data: FeedHealthData }) {
  return (
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-4">📡 Feed Health</h2>
      <HealthBar label="RSS Feed URL" value={data.withFeedUrl} total={data.total} color="#22c55e" />
      <HealthBar label="Spotify ID" value={data.withSpotifyId} total={data.total} color="#1DB954" />
      <HealthBar label="iTunes ID" value={data.withItunesId} total={data.total} color="#a855f7" />
      <HealthBar label="Google Podcasts ID" value={data.withGoogleId} total={data.total} color="#4285F4" />
      <HealthBar label="iHeart ID" value={data.withIheartId} total={data.total} color="#C6002B" />
    </div>
  );
}
