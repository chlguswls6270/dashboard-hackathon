'use client';

import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts';

type OHLC = { date: string; open: number; high: number; low: number; close: number; volume: number };

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

function fmtNum(v: number) {
  if (!v || isNaN(v)) return '-';
  if (v >= 1e8) return `₩${(v / 1e8).toFixed(1)}억`;
  if (v >= 1e4) return `₩${(v / 1e4).toFixed(0)}만`;
  return `₩${v.toLocaleString()}`;
}

// Custom candlestick bar — each bar covers the open-close body, wick via a separate layer
function CandleBar(props: any) {
  const { x, y, width, height, open, close, high, low, payload } = props;
  if (open === undefined || close === undefined) return null;

  const isUp = props.isUp as boolean; // 전날 종가 대비 판단
  const color = isUp ? '#ef4444' : '#3b82f6'; // 한국: 상승=빨강 하락=파랑
  const bodyY = Math.min(y, y + height);
  const bodyH = Math.max(Math.abs(height), 1);

  // Scale: we need real price coords — recharts gives us scaled y already for close
  // We derive high/low pixel positions relative to y and height of body
  const priceRange = Math.abs(open - close) || 1;
  const pxPerUnit = bodyH / priceRange;
  const highOffset = (Math.max(open, close) - low) * pxPerUnit; // not used here – SVG approach
  const center = x + width / 2;

  // Since recharts gives us y/height for the [open, close] bar domain,
  // we need separate calcs for wick. Use payload values for that.
  const chartHigh = payload.high;
  const chartLow = payload.low;
  const chartMax = Math.max(open, close);
  const chartMin = Math.min(open, close);

  const wickTopH = ((chartHigh - chartMax) / priceRange) * bodyH;
  const wickBotH = ((chartMin - chartLow) / priceRange) * bodyH;

  return (
    <g>
      {/* Top wick */}
      <line
        x1={center} y1={bodyY - wickTopH}
        x2={center} y2={bodyY}
        stroke={color} strokeWidth={1.5}
      />
      {/* Body */}
      <rect
        x={x + 1} y={bodyY} width={Math.max(width - 2, 1)} height={bodyH}
        fill={color}
        fillOpacity={isUp ? 0.9 : 0.85}
        rx={1}
      />
      {/* Bottom wick */}
      <line
        x1={center} y1={bodyY + bodyH}
        x2={center} y2={bodyY + bodyH + wickBotH}
        stroke={color} strokeWidth={1.5}
      />
    </g>
  );
}

function CandleTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as OHLC & { prevClose?: number };
  if (!d) return null;
  // 전날 종가 대비 등락 판단
  const isUp = d.prevClose !== undefined ? d.close >= d.prevClose : d.close >= d.open;
  return (
    <div style={tooltipStyle}>
      <p style={{ marginBottom: 6, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
        {d.date}
      </p>
      {[
        { label: '시가', val: d.open },
        { label: '고가', val: d.high },
        { label: '저가', val: d.low },
        { label: '종가', val: d.close },
      ].map(({ label, val }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{label}</span>
          <span style={{ fontWeight: 600, color: label === '종가' ? (isUp ? '#ef4444' : '#3b82f6') : 'rgba(255,255,255,0.9)', fontSize: 12 }}>
            {fmtNum(val)}
          </span>
        </div>
      ))}
      {d.prevClose !== undefined && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>전일대비</span>
          <span style={{ fontWeight: 700, color: isUp ? '#ef4444' : '#3b82f6', fontSize: 12 }}>
            {isUp ? '+' : ''}{((d.close - d.prevClose) / d.prevClose * 100).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function StockChart({ history }: { history: OHLC[] }) {
  const [period, setPeriod] = useState('3M');
  const [viewMode, setViewMode] = useState<'candle' | 'area'>('candle');

  const filtered = useMemo(() => {
    const days = PERIODS.find(p => p.label === period)?.days ?? 90;
    return history.slice(-days);
  }, [history, period]);

  // candleData: prevClose 추가해서 전날 대비 등락 판단
  const candleData = useMemo(() =>
    filtered.map((d, i) => {
      const prevClose = i > 0 ? filtered[i - 1].close : d.open;
      const isUp = d.close >= prevClose;
      return {
        ...d,
        prevClose,
        isUp,
        range: [Math.min(d.open, d.close), Math.max(d.open, d.close)] as [number, number],
      };
    }),
    [filtered]
  );

  const priceMin = useMemo(() => Math.min(...filtered.map(d => d.low)) * 0.998, [filtered]);
  const priceMax = useMemo(() => Math.max(...filtered.map(d => d.high)) * 1.002, [filtered]);

  const lastClose = filtered[filtered.length - 1]?.close ?? 0;
  const firstClose = filtered[0]?.close ?? 0;
  const overallChange = firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;
  const isOverallUp = overallChange >= 0;
  const areaColor = isOverallUp ? '#ef4444' : '#3b82f6'; // 한국 기준

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>주가 추이</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: isOverallUp ? '#ef4444' : '#3b82f6' }}>
            {overallChange > 0 ? '+' : ''}{overallChange.toFixed(2)}%
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>({period} 기준)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '3px' }}>
            {(['candle', 'area'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '5px 14px', fontSize: '12px', fontWeight: 600,
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: viewMode === mode ? 'rgba(99,102,241,0.3)' : 'transparent',
                  color: viewMode === mode ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {mode === 'candle' ? '🕯 캔들' : '📈 라인'}
              </button>
            ))}
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
      </div>

      {/* Chart */}
      {viewMode === 'candle' ? (
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={candleData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fill: '#475569', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={Math.max(1, Math.floor(candleData.length / 10))}
            />
            <YAxis
              domain={[priceMin, priceMax]}
              tickFormatter={v => fmtNum(v)}
              tick={{ fill: '#475569', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={72}
              orientation="right"
            />
            <Tooltip content={<CandleTooltip />} />
            <Bar
              dataKey="range"
              shape={(props: any) => {
                const payload = props.payload as OHLC;
                return (
                  <CandleBar
                    {...props}
                    open={payload.open}
                    close={payload.close}
                    high={payload.high}
                    low={payload.low}
                    payload={payload}
                    isUp={(payload as any).isUp}
                  />
                );
              }}
            >
              {candleData.map((entry, i) => (
                <Cell key={i} fill={entry.isUp ? '#ef4444' : '#3b82f6'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={filtered} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
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
              tickFormatter={v => fmtNum(v)}
              tick={{ fill: '#475569', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={72}
              orientation="right"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`₩${v.toLocaleString()}`, '종가']}
              labelFormatter={fmtDate}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={areaColor}
              fill="url(#stockAreaGrad)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
