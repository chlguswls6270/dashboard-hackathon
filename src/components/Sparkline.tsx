'use client';

import { useId } from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number | string;
  height?: number | string;
  dates?: string[];   // optional ISO date strings aligned to data[]
  prefix?: string;    // e.g. '₩' or '$'
  suffix?: string;    // e.g. '%'
  interactive?: boolean;
}

function CustomTooltip({ active, payload, dates, prefix = '', suffix = '' }: any) {
  if (!active || !payload?.length) return null;

  const idx = payload[0]?.payload?.i ?? 0;
  const val: number = payload[0]?.value ?? 0;
  const date = dates?.[idx];
  const formatted = Math.abs(val) >= 1000
    ? val.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
    : val.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '7px 10px',
      fontSize: '11px',
      lineHeight: 1.55,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(26,26,26,0.12)',
    }}>
      {date && <p style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>{date}</p>}
      <p style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
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
  interactive = false,
}: SparklineProps) {
  const chartData = data.map((val, i) => ({ val, i }));
  const reactId = useId().replace(/:/g, '');
  const gradId = `sparkGrad-${reactId}`;

  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        minWidth: typeof width === 'number' ? width : undefined,
        pointerEvents: interactive ? 'auto' : 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.16} />
              <stop offset="55%" stopColor={color} stopOpacity={0.07} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          {interactive && (
            <Tooltip
              content={<CustomTooltip dates={dates} prefix={prefix} suffix={suffix} />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.45 }}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ zIndex: 100 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            fill={`url(#${gradId})`}
            strokeWidth={2}
            dot={false}
            activeDot={interactive ? { r: 2.5, fill: color, strokeWidth: 0 } : false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
