'use client';

import { useState, useCallback } from 'react';

interface DateRangePickerProps {
  availableDates: string[]; // sorted array of date strings "YYYY-MM-DD"
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({
  availableDates,
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  const formatDateFull = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const isFullRange =
    startDate === availableDates[0] && endDate === availableDates[availableDates.length - 1];

  const selectedDays = availableDates.filter(d => d >= startDate && d <= endDate).length;

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStart = e.target.value;
      // Ensure start <= end
      if (newStart > endDate) {
        onChange(newStart, newStart);
      } else {
        onChange(newStart, endDate);
      }
    },
    [endDate, onChange]
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newEnd = e.target.value;
      // Ensure start <= end
      if (newEnd < startDate) {
        onChange(newEnd, newEnd);
      } else {
        onChange(startDate, newEnd);
      }
    },
    [startDate, onChange]
  );

  const handleReset = useCallback(() => {
    onChange(availableDates[0], availableDates[availableDates.length - 1]);
  }, [availableDates, onChange]);

  // Quick presets
  const presets = [
    {
      label: 'All',
      start: availableDates[0],
      end: availableDates[availableDates.length - 1],
    },
    ...(availableDates.length >= 3
      ? [
          {
            label: 'Last 3 days',
            start: availableDates[Math.max(0, availableDates.length - 3)],
            end: availableDates[availableDates.length - 1],
          },
        ]
      : []),
    ...(availableDates.length >= 5
      ? [
          {
            label: 'Last 5 days',
            start: availableDates[Math.max(0, availableDates.length - 5)],
            end: availableDates[availableDates.length - 1],
          },
        ]
      : []),
  ];

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg
            className="w-5 h-5 text-[#D4A847]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-white">Date Range</span>
        </div>

        {/* Preset buttons */}
        <div className="flex items-center gap-1.5">
          {presets.map((preset) => {
            const isActive = startDate === preset.start && endDate === preset.end;
            return (
              <button
                key={preset.label}
                onClick={() => onChange(preset.start, preset.end)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#D4A847]/20 text-[#D4A847] border border-[#D4A847]/30 font-medium'
                    : 'bg-[#1e1e35] text-[#6b6b80] hover:text-white hover:bg-[#2a2a45] border border-transparent'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom range selectors */}
        <div className="flex items-center gap-2 flex-1">
          <select
            value={startDate}
            onChange={handleStartChange}
            className="bg-[#1e1e35] text-white text-sm rounded-lg px-3 py-1.5 border border-[#2a2a45] focus:border-[#D4A847] focus:outline-none cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b6b80' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              paddingRight: '28px',
            }}
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {formatDateFull(d)}
              </option>
            ))}
          </select>

          <span className="text-[#6b6b80] text-sm">to</span>

          <select
            value={endDate}
            onChange={handleEndChange}
            className="bg-[#1e1e35] text-white text-sm rounded-lg px-3 py-1.5 border border-[#2a2a45] focus:border-[#D4A847] focus:outline-none cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b6b80' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              paddingRight: '28px',
            }}
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {formatDateFull(d)}
              </option>
            ))}
          </select>
        </div>

        {/* Info badge */}
        <div className="flex-shrink-0">
          <span
            className={`text-xs px-2.5 py-1 rounded-full ${
              isFullRange
                ? 'bg-[#D4A847]/10 text-[#D4A847]'
                : 'bg-[#3B82F6]/10 text-[#3B82F6]'
            }`}
          >
            {selectedDays} {selectedDays === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </div>
  );
}
