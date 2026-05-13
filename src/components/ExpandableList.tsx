'use client';

import { useState, useMemo } from 'react';

interface ExpandableListProps<T> {
  items: T[];
  defaultLimit?: number;
  stepLimit?: number;
  renderItems: (visibleItems: T[], startIndex: number) => React.ReactNode;
  label?: string;
}

export default function ExpandableList<T>({
  items,
  defaultLimit = 20,
  stepLimit = 50,
  renderItems,
  label = 'items',
}: ExpandableListProps<T>) {
  const [limit, setLimit] = useState(defaultLimit);

  const visibleItems = useMemo(() => items.slice(0, limit), [items, limit]);
  const total = items.length;
  const isShowingAll = limit >= total;
  const isAtDefault = limit === defaultLimit;

  if (total <= defaultLimit) {
    return <>{renderItems(items, 0)}</>;
  }

  const handleShowMore = () => {
    if (limit <= defaultLimit) {
      setLimit(stepLimit);
    } else {
      setLimit(total);
    }
  };

  const handleShowLess = () => {
    setLimit(defaultLimit);
  };

  return (
    <>
      {renderItems(visibleItems, 0)}
      <div className="flex items-center justify-center gap-3 pt-3 pb-1">
        {!isShowingAll && (
          <button
            onClick={handleShowMore}
            className="text-sm text-[#D4A847] hover:text-[#c49a3f] transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-[#D4A847]/5"
          >
            <span>
              Showing {Math.min(limit, total).toLocaleString()} of {total.toLocaleString()} {label}
            </span>
            <span className="text-xs">
              — Show {limit <= defaultLimit ? stepLimit : 'All'}
            </span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        {!isAtDefault && (
          <button
            onClick={handleShowLess}
            className="text-sm text-[#6b6b80] hover:text-white transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-[#1e1e35]/50"
          >
            {isShowingAll && (
              <span className="text-[#6b6b80] mr-1">
                Showing all {total.toLocaleString()} {label}
              </span>
            )}
            <span>Show Less</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
