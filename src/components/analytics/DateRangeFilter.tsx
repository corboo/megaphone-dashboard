'use client';

interface Props {
  availableDates: string[];
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onReset: () => void;
  isFullRange: boolean;
}

function formatLabel(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function DateRangeFilter({
  availableDates,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onReset,
  isFullRange,
}: Props) {
  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] px-5 py-3 flex flex-wrap items-center gap-4">
      <span className="text-sm text-[#6b6b80] font-medium">Date Range</span>

      <div className="flex items-center gap-2">
        <select
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="bg-[#0a0a1a] border border-[#1e1e35] rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#D4A847]/40 outline-none"
        >
          {availableDates.map((d) => (
            <option key={d} value={d} disabled={d > endDate}>
              {formatLabel(d)}
            </option>
          ))}
        </select>

        <span className="text-[#6b6b80] text-sm">to</span>

        <select
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="bg-[#0a0a1a] border border-[#1e1e35] rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#D4A847]/40 outline-none"
        >
          {availableDates.map((d) => (
            <option key={d} value={d} disabled={d < startDate}>
              {formatLabel(d)}
            </option>
          ))}
        </select>
      </div>

      {!isFullRange && (
        <button
          onClick={onReset}
          className="text-xs text-[#D4A847] hover:text-[#c49a3f] transition-colors"
        >
          Reset to full range
        </button>
      )}

      <span className="text-xs text-[#6b6b80] ml-auto">
        {formatLabel(startDate)} — {formatLabel(endDate)}
        {' '}({availableDates.filter(d => d >= startDate && d <= endDate).length} days)
      </span>
    </div>
  );
}
