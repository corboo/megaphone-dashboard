'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { hour: number; count: number }[];
}

export default function HourlyChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: `${d.hour.toString().padStart(2, '0')}:00`,
    displayLabel: d.hour % 3 === 0 ? `${d.hour.toString().padStart(2, '0')}:00` : '',
  }));

  const peakHour = data.reduce((max, d) => (d.count > max.count ? d : max), data[0]);

  return (
    <div className="bg-[#12121f] rounded-xl border border-[#1e1e35] p-5">
      <h2 className="text-lg font-semibold mb-1">Hourly Listening Pattern</h2>
      <p className="text-[#6b6b80] text-sm mb-4">
        Downloads by hour (UTC) · Peak: {peakHour.hour.toString().padStart(2, '0')}:00 ({peakHour.count.toLocaleString()})
      </p>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A847" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4A847" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
            <XAxis
              dataKey="label"
              stroke="#6b6b80"
              fontSize={10}
              interval={2}
            />
            <YAxis
              stroke="#6b6b80"
              fontSize={11}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`
              }
            />
            <Tooltip
              contentStyle={{ background: '#12121f', border: '1px solid #1e1e35', borderRadius: 8 }}
              formatter={(value: number) => [value.toLocaleString(), 'Downloads']}
              labelFormatter={(label: string) => `Hour: ${label} UTC`}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#D4A847"
              strokeWidth={2}
              fill="url(#hourlyGradient)"
              dot={{ fill: '#D4A847', r: 3 }}
              activeDot={{ r: 5, fill: '#c49a3f' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
