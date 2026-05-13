'use client';

import { useState } from 'react';

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
    <div className="bg-[#1e2235] rounded-xl border border-[#2a2f45] p-5">
      <h2 className="text-lg font-semibold mb-1">🗺️ Geographic Breakdown</h2>
      <p className="text-[#8b90a5] text-sm mb-4">
        Country → Region breakdown · {grandTotal.toLocaleString()} downloads
      </p>
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {data.map((geo) => {
          const flag = COUNTRY_FLAGS[geo.country] || '🏳️';
          const isExpanded = expanded === geo.country;
          const pct = grandTotal > 0 ? ((geo.total / grandTotal) * 100).toFixed(1) : '0';

          return (
            <div key={geo.country}>
              <button
                className="w-full flex items-center justify-between p-2 hover:bg-[#252940] rounded-lg transition-colors"
                onClick={() => setExpanded(isExpanded ? null : geo.country)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                  <span>{flag}</span>
                  <span className="text-sm font-medium">{geo.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8b90a5]">{pct}%</span>
                  <span className="text-sm font-mono text-[#6366f1]">{geo.total.toLocaleString()}</span>
                </div>
              </button>
              {isExpanded && (
                <div className="ml-10 mb-2 space-y-1">
                  {geo.regions.map((r) => (
                    <div key={r.region} className="flex items-center justify-between text-xs py-1">
                      <span className="text-[#8b90a5]">{r.region}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-[#2a2f45] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#818cf8]"
                            style={{ width: `${(r.count / geo.regions[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[#818cf8] w-12 text-right">{r.count.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
