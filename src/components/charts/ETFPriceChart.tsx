'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type PricePoint = { date: string; price: number; volume: number };

const PERIODS = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 9999 },
];

const tooltipStyle = {
  backgroundColor: '#0f1629',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#e2e8f0',
  fontSize: 12,
  padding: '10px 14px',
};

function fmtDate(d: string) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function fmtPrice(v: number) {
  if (!v || isNaN(v)) return '-';
  if (v >= 1e8) return `₩${(v / 1e8).toFixed(1)}억`;
  if (v >= 1e4) return `₩${(v / 1e4).toFixed(0)}만`;
  return `₩${v.toLocaleString()}`;
}

export default function ETFPriceChart({ priceHistory }: { priceHistory: PricePoint[] }) {
  const [period, setPeriod] = useState('3M');

  const filtered = useMemo(() => {
    const days = PERIODS.find(p => p.label === period)?.days ?? 90;
    return priceHistory.slice(-days);
  }, [priceHistory, period]);

  const priceMin = useMemo(() => Math.min(...filtered.map(d => d.price)) * 0.998, [filtered]);
  const priceMax = useMemo(() => Math.max(...filtered.map(d => d.price)) * 1.002, [filtered]);

  const lastPrice = filtered[filtered.length - 1]?.price ?? 0;
  const firstPrice = filtered[0]?.price ?? 0;
  const change = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const isUp = change >= 0;
  // 한국 ETF: 상승=빨강, 하락=파랑
  const lineColor = isUp ? '#ef4444' : '#3b82f6';

  return (
    <div style={{ marginTop: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>가격 추이</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: lineColor }}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>({period} 기준)</span>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          {PERIODS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setPeriod(label)}
              style={{
                padding: '5px 12px', fontSize: '12px', fontWeight: 600,
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: period === label ? 'rgba(99,102,241,0.3)' : 'transparent',
                color: period === label ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={filtered} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="etfAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={Math.max(1, Math.floor(filtered.length / 10))}
          />
          <YAxis
            domain={[priceMin, priceMax]}
            tickFormatter={v => fmtPrice(v)}
            tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={72}
            orientation="right"
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: any) => [`₩${v.toLocaleString()}`, '가격']}
            labelFormatter={(d: any) => fmtDate(d as string)}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            fill="url(#etfAreaGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
