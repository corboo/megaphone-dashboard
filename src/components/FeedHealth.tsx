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
        <span className="text-[#e8e8f0]">{label}</span>
        <span className="text-[#6b6b80]">
          {value.toLocaleString()} / {total.toLocaleString()} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-3 bg-[#1e1e35] rounded-full overflow-hidden">
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
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-4">Feed Health</h2>
      <HealthBar label="RSS Feed URL" value={data.withFeedUrl} total={data.total} color="#D4A847" />
      <HealthBar label="Spotify ID" value={data.withSpotifyId} total={data.total} color="#1DB954" />
      <HealthBar label="iTunes ID" value={data.withItunesId} total={data.total} color="#3B82F6" />
      <HealthBar label="Google Podcasts ID" value={data.withGoogleId} total={data.total} color="#60A5FA" />
      <HealthBar label="iHeart ID" value={data.withIheartId} total={data.total} color="#c49a3f" />
    </div>
  );
}
