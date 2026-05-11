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
  backgroundColor: '#FFFFFF',
  border: '1px solid #D7DCE3',
  borderRadius: 8,
  color: '#1A1A1A',
  fontSize: 11,
  padding: '9px 12px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.10)',
};

const UP_COLOR = '#007AFF';
const DOWN_COLOR = '#FF4D4D';
const GRID_COLOR = '#E1E5EB';
const AXIS_COLOR = '#A8B0BA';

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
  const color = isUp ? UP_COLOR : DOWN_COLOR;
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
  const candleW = Math.min(Math.max(width * 0.82, 5), 16);
  const candleX = center - candleW / 2;

  return (
    <g>
      {/* Top wick */}
      <line
        x1={center} y1={bodyY - wickTopH}
        x2={center} y2={bodyY}
        stroke={color} strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={candleX} y={bodyY} width={candleW} height={bodyH}
        fill={color}
        fillOpacity={1}
        rx={0}
      />
      {/* Bottom wick */}
      <line
        x1={center} y1={bodyY + bodyH}
        x2={center} y2={bodyY + bodyH + wickBotH}
        stroke={color} strokeWidth={1}
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
      <p style={{ marginBottom: 6, fontWeight: 700, color: 'var(--text-primary)', fontSize: 11 }}>
        {d.date}
      </p>
      {[
        { label: '시가', val: d.open },
        { label: '고가', val: d.high },
        { label: '저가', val: d.low },
        { label: '종가', val: d.close },
      ].map(({ label, val }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{label}</span>
          <span style={{ fontWeight: 600, color: label === '종가' ? (isUp ? 'var(--success)' : 'var(--danger)') : 'var(--text-primary)', fontSize: 12 }}>
            {fmtNum(val)}
          </span>
        </div>
      ))}
      {d.prevClose !== undefined && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>전일대비</span>
          <span style={{ fontWeight: 700, color: isUp ? 'var(--success)' : 'var(--danger)', fontSize: 12 }}>
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
  const areaColor = isOverallUp ? 'var(--success)' : 'var(--danger)';

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>주가 추이</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: isOverallUp ? UP_COLOR : DOWN_COLOR }}>
            {overallChange > 0 ? '+' : ''}{overallChange.toFixed(2)}%
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({period} 기준)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px' }}>
            {(['candle', 'area'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '5px 14px', fontSize: '12px', fontWeight: 650,
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: viewMode === mode ? 'var(--brand-green-soft)' : 'transparent',
                  color: viewMode === mode ? 'var(--brand-green-dark)' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {mode === 'candle' ? '캔들' : '라인'}
              </button>
            ))}
          </div>

          {/* Period selector */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
            {PERIODS.map(({ label }) => (
              <button
                key={label}
                onClick={() => setPeriod(label)}
                style={{
                  padding: '5px 12px', fontSize: '12px', fontWeight: 650,
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: period === label ? 'var(--brand-green-soft)' : 'transparent',
                  color: period === label ? 'var(--brand-green-dark)' : 'var(--text-secondary)',
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
        <div style={{
          border: `1px solid ${GRID_COLOR}`,
          borderRadius: '10px',
          background: '#FFFFFF',
          padding: '8px 0 4px',
        }}>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={candleData} margin={{ top: 8, right: 8, bottom: 2, left: 0 }} barCategoryGap="36%">
              <CartesianGrid stroke={GRID_COLOR} vertical horizontal strokeWidth={1} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
                tickLine={{ stroke: AXIS_COLOR, strokeWidth: 1 }}
                axisLine={{ stroke: AXIS_COLOR, strokeWidth: 1 }}
                interval={Math.max(1, Math.floor(candleData.length / 8))}
                minTickGap={18}
              />
              <YAxis
                domain={[priceMin, priceMax]}
                tickFormatter={v => fmtNum(v)}
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
                tickLine={{ stroke: AXIS_COLOR, strokeWidth: 1 }}
                axisLine={{ stroke: AXIS_COLOR, strokeWidth: 1 }}
                width={76}
                orientation="right"
              />
              <Tooltip content={<CandleTooltip />} cursor={{ stroke: '#64748B', strokeWidth: 1, strokeDasharray: '3 4', opacity: 0.45 }} />
              <Bar
                dataKey="range"
                maxBarSize={8}
                isAnimationActive={false}
                activeBar={false}
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
                  <Cell key={i} fill={entry.isUp ? UP_COLOR : DOWN_COLOR} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={filtered} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} strokeDasharray="2 6" />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fill: '#9AA3AF', fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              interval={Math.max(1, Math.floor(filtered.length / 10))}
            />
            <YAxis
              domain={[priceMin, priceMax]}
              tickFormatter={v => fmtNum(v)}
              tick={{ fill: '#9AA3AF', fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={72}
              orientation="right"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: any) => [`₩${v.toLocaleString()}`, '종가']}
              labelFormatter={(d: any) => fmtDate(d as string)}
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
