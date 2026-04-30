'use client';

import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number | string;
  height?: number | string;
  dates?: string[];   // optional ISO date strings aligned to data[]
  prefix?: string;    // e.g. '₩' or '$'
  suffix?: string;    // e.g. '%'
}

function CustomTooltip({ active, payload, dates, prefix = '', suffix = '' }: any) {
  if (!active || !payload?.length) return null;
  const idx = payload[0]?.payload?.i ?? 0;
  const val: number = payload[0]?.value ?? 0;
  const date = dates?.[idx];

  const formatted = val > 1000
    ? val.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
    : val.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{
      background: 'rgba(10,14,26,0.95)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px',
      padding: '7px 10px',
      fontSize: '11px',
      lineHeight: 1.6,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    }}>
      {date && (
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2px' }}>{date}</p>
      )}
      <p style={{ color: 'white', fontWeight: 700 }}>
        {prefix}{formatted}{suffix}
      </p>
    </div>
  );
}

export default function Sparkline({
  data, color,
  width = 80, height = 40,
  dates,
  prefix = '',
  suffix = '',
}: SparklineProps) {
  const chartData = data.map((val, i) => ({ val, i }));
  const gradId = `sparkGrad-${color.replace('#', '')}-${width}`;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip
            content={<CustomTooltip dates={dates} prefix={prefix} suffix={suffix} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.5 }}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 50 }}
          />
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            fill={`url(#${gradId})`}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
