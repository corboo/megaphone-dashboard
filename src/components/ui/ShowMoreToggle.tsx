'use client';

interface Props {
  total: number;
  visible: number;
  onShowMore: () => void;
  onShowLess: () => void;
  options?: number[];
}

export default function ShowMoreToggle({ total, visible, onShowMore, onShowLess }: Props) {
  if (total <= 20) return null;

  const isExpanded = visible >= total;

  return (
    <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-[#1e1e35]">
      {!isExpanded ? (
        <button
          onClick={onShowMore}
          className="text-sm text-[#D4A847] hover:text-[#c49a3f] transition-colors flex items-center gap-1"
        >
          Show all {total.toLocaleString()} results
          <span className="text-xs">▼</span>
        </button>
      ) : (
        <button
          onClick={onShowLess}
          className="text-sm text-[#6b6b80] hover:text-white transition-colors flex items-center gap-1"
        >
          Show less
          <span className="text-xs">▲</span>
        </button>
      )}
      <span className="text-xs text-[#6b6b80]">
        Showing {Math.min(visible, total)} of {total.toLocaleString()}
      </span>
    </div>
  );
}
