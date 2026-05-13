'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  data: { country: string; count: number }[];
}

const COUNTRY_NAMES: Record<string, string> = {
  US: '🇺🇸 United States',
  GB: '🇬🇧 United Kingdom',
  CA: '🇨🇦 Canada',
  IN: '🇮🇳 India',
  AU: '🇦🇺 Australia',
  DE: '🇩🇪 Germany',
  KR: '🇰🇷 South Korea',
  ZA: '🇿🇦 South Africa',
  NZ: '🇳🇿 New Zealand',
  IE: '🇮🇪 Ireland',
  BR: '🇧🇷 Brazil',
  PH: '🇵🇭 Philippines',
  MX: '🇲🇽 Mexico',
  FR: '🇫🇷 France',
  SG: '🇸🇬 Singapore',
  JP: '🇯🇵 Japan',
  SE: '🇸🇪 Sweden',
  NL: '🇳🇱 Netherlands',
  NG: '🇳🇬 Nigeria',
  KE: '🇰🇪 Kenya',
  IT: '🇮🇹 Italy',
  ES: '🇪🇸 Spain',
  PK: '🇵🇰 Pakistan',
  MY: '🇲🇾 Malaysia',
  NO: '🇳🇴 Norway',
  DK: '🇩🇰 Denmark',
  FI: '🇫🇮 Finland',
  CH: '🇨🇭 Switzerland',
  AT: '🇦🇹 Austria',
  HK: '🇭🇰 Hong Kong',
  TW: '🇹🇼 Taiwan',
  TH: '🇹🇭 Thailand',
};

const COLORS = [
  '#D4A847', '#3B82F6', '#c49a3f', '#60A5FA', '#b08d35',
  '#93C5FD', '#D4A847', '#3B82F6', '#c49a3f', '#60A5FA',
  '#b08d35', '#93C5FD', '#D4A847', '#3B82F6', '#c49a3f',
];

export default function CountryChart({ data }: Props) {
  const chartData = data.slice(0, 15).map((d) => ({
    ...d,
    name: COUNTRY_NAMES[d.country] || d.country,
    shortName: d.country,
  }));

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Downloads by Country</h2>
      <p className="text-[#6b6b80] text-sm mb-4">Top 15 countries by download count</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" horizontal={false} />
            <XAxis type="number" stroke="#6b6b80" fontSize={11} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
            <YAxis dataKey="name" type="category" stroke="#6b6b80" fontSize={11} width={110} />
            <Tooltip
              contentStyle={{ background: '#12121f', border: '1px solid #1e1e35', borderRadius: 8 }}
              formatter={(value: number) => [value.toLocaleString(), 'Downloads']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
