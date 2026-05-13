'use client';

interface Episode {
  episode_id: string;
  podcast_id: string;
  show: string;
  count: number;
  duration: number;
}

export default function TopEpisodesTable({ episodes }: { episodes: Episode[] }) {
  const formatDuration = (secs: number) => {
    if (!secs) return '—';
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hours}h ${rem}m`;
  };

  const maxCount = episodes.length > 0 ? episodes[0].count : 1;

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Top Episodes by Downloads</h2>
      <p className="text-[#6b6b80] text-sm mb-4">Most downloaded individual episodes</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e35]">
              <th className="text-left p-2 text-[#6b6b80] font-medium w-10">#</th>
              <th className="text-left p-2 text-[#6b6b80] font-medium">Episode ID</th>
              <th className="text-left p-2 text-[#6b6b80] font-medium">Show</th>
              <th className="text-right p-2 text-[#6b6b80] font-medium">Duration</th>
              <th className="text-right p-2 text-[#6b6b80] font-medium">Downloads</th>
              <th className="p-2 text-[#6b6b80] font-medium w-32"></th>
            </tr>
          </thead>
          <tbody>
            {episodes.slice(0, 20).map((ep, i) => (
              <tr
                key={ep.episode_id}
                className="border-b border-[#1e1e35]/50 hover:bg-[#1a1a2e] transition-colors"
              >
                <td className="p-2 text-[#6b6b80]">{i + 1}</td>
                <td className="p-2 font-mono text-xs max-w-[200px] truncate text-[#3B82F6]" title={ep.episode_id}>
                  {ep.episode_id.slice(0, 8)}…
                </td>
                <td className="p-2 font-medium max-w-[300px] truncate" title={ep.show}>
                  {ep.show}
                </td>
                <td className="p-2 text-right text-[#6b6b80] text-xs">
                  {formatDuration(ep.duration)}
                </td>
                <td className="p-2 text-right font-mono text-[#D4A847]">
                  {ep.count.toLocaleString()}
                </td>
                <td className="p-2">
                  <div className="w-full h-2 bg-[#1e1e35] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3B82F6]"
                      style={{ width: `${(ep.count / maxCount) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
