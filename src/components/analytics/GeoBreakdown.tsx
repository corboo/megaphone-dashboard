'use client';

import { useState } from 'react';
import ExpandableList from '../ExpandableList';

interface GeoData {
  country: string;
  total: number;
  regions: { region: string; count: number }[];
}

interface Props {
  data: GeoData[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', IN: '🇮🇳', AU: '🇦🇺',
  DE: '🇩🇪', KR: '🇰🇷', ZA: '🇿🇦', NZ: '🇳🇿', IE: '🇮🇪',
  BR: '🇧🇷', PH: '🇵🇭', MX: '🇲🇽', FR: '🇫🇷', SG: '🇸🇬',
  JP: '🇯🇵', SE: '🇸🇪', NL: '🇳🇱', NG: '🇳🇬', KE: '🇰🇪',
};

export default function GeoBreakdown({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(data[0]?.country || null);
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Geographic Breakdown</h2>
      <p className="text-[#6b6b80] text-sm mb-4">
        {data.length.toLocaleString()} countries · {grandTotal.toLocaleString()} downloads
      </p>
      <ExpandableList
        items={data}
        defaultLimit={20}
        stepLimit={50}
        label="countries"
        renderItems={(visibleItems) => (
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {visibleItems.map((geo) => {
              const flag = COUNTRY_FLAGS[geo.country] || '🏳️';
              const isExpanded = expanded === geo.country;
              const pct = grandTotal > 0 ? ((geo.total / grandTotal) * 100).toFixed(1) : '0';

              return (
                <div key={geo.country}>
                  <button
                    className="w-full flex items-center justify-between p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : geo.country)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                      <span>{flag}</span>
                      <span className="text-sm font-medium">{geo.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#6b6b80]">{pct}%</span>
                      <span className="text-sm font-mono text-[#D4A847]">{geo.total.toLocaleString()}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="ml-10 mb-2 space-y-1">
                      {geo.regions.map((r) => (
                        <div key={r.region} className="flex items-center justify-between text-xs py-1">
                          <span className="text-[#6b6b80]">{r.region}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-[#1e1e35] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#3B82F6]"
                                style={{ width: `${(r.count / geo.regions[0].count) * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-[#3B82F6] w-12 text-right">{r.count.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      />
    </div>
  );
}
