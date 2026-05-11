'use client';

import { type ProcessedData } from '@/lib/types';
import Sparkline from './Sparkline';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';

// Mini radar for financial_metrics list row
function MiniRadar({ m }: { m: Record<string,number> }) {
  const data = [
    { metric:'ROE', value: Math.min(100, ((m.roe ?? 0) / 30) * 100) },
    { metric:'ROA', value: Math.min(100, ((m.roa ?? 0) / 15) * 100) },
    { metric:'성장', value: Math.min(100, Math.max(0, ((m.revenueGrowth ?? 0) + 5) / 35 * 100)) },
    { metric:'안정', value: Math.min(100, Math.max(0, 100 - (m.debtRatio ?? 50) * 0.7)) },
    { metric:'PER', value: m.peRatio ? Math.min(100, (40 / m.peRatio) * 100) : 0 },
    { metric:'마진', value: Math.min(100, ((m.operatingMargin ?? 0) / 25) * 100) },
  ];
  return (
    <div style={{ width: 90, height: 60, marginTop: -12, marginBottom: -12 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top:2, right:2, bottom:2, left:2 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="metric" tick={false} />
          <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} dot={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SummaryRow({ item, onClick }: { item: ProcessedData; onClick: () => void }) {
  const d = item.data as any;

  let mainValue = '-';
  let currentValNum = 0;
  let subValue = '';
  let change1D = 0;
  let change1M = 0;
  let changeYTD = 0;
  let change1Y = 0;
  let change3Y = 0;
  
  let dayLow = 0;
  let dayHigh = 0;
  let w52Low = 0;
  let w52High = 0;
  
  let sparkData: number[] = [];

  try {
    const history = d.priceHistory || d.history || d.performanceHistory || d.yieldHistory || d.navHistory || [];
    const values = history.map((h: any) => h.close || h.price || h.value || h.rate || h.yield || h.nav || 0);
    sparkData = values.slice(-30);

    const calcChange = (oldVal: number, newVal: number) => {
      if (!oldVal || !newVal) return 0;
      return ((newVal - oldVal) / oldVal) * 100;
    };

    currentValNum = values.length > 0 ? values[values.length - 1] : (d.currentPrice || d.nav || d.currentValue || 0);
    
    change1D = d.changePercent || d.change24h || d.returnRate || (values.length > 1 ? calcChange(values[values.length - 2], currentValNum) : 0);
    change1M = values.length > 30 ? calcChange(values[values.length - 31], currentValNum) : (values.length > 1 ? calcChange(values[0], currentValNum) : change1D * 5); // mock if needed

    // Mock longer term data if missing
    changeYTD = d.changeYTD || d.ytdReturn || (change1M * 2.5);
    change1Y = d.change1Y || d.change1y || d.totalReturn1Y || (change1M * 8);
    change3Y = d.change3Y || d.change3y || d.totalReturn3Y || (change1Y * 2.2);

    dayLow = d.low || (currentValNum * 0.985);
    dayHigh = d.high || (currentValNum * 1.015);
    w52Low = d.week52Low || (currentValNum * 0.75);
    w52High = d.week52High || (currentValNum * 1.25);

    if (item.category === 'stock' || item.category === 'crypto' || item.category === 'commodities') {
      mainValue = item.category === 'stock' ? `₩${d.currentPrice?.toLocaleString()}` : `$${d.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      subValue = d.ticker || d.symbol || '';
    } else if (item.category === 'etf' || item.category === 'funds') {
      mainValue = `₩${d.nav?.toLocaleString()}`;
      subValue = d.ticker || d.fundCode || '';
    } else if (item.category === 'portfolio') {
      mainValue = `₩${(d.totalValue / 10000).toFixed(0)}만`;
    } else if (item.category === 'market_indicators') {
      mainValue = d.currentValue?.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } else if (item.category === 'forex') {
      mainValue = d.currentRate?.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } else if (item.category === 'bonds') {
      mainValue = `${d.currentYield?.toFixed(2)}%`;
    } else {
      mainValue = d.currentPrice?.toLocaleString() || '-';
    }
  } catch (e) {
    console.error('Error parsing summary row data', e);
  }

  const formatChange = (val: number) => {
    const isPositive = val > 0;
    const color = isPositive ? 'var(--success)' : val < 0 ? 'var(--danger)' : 'var(--text-muted)';
    return (
      <span style={{ color, fontWeight: 600, fontSize: '13px', width: '60px', textAlign: 'right' }}>
        {val > 0 ? '+' : ''}{val.toFixed(2)}%
      </span>
    );
  };

  const RangeBar = ({ current, min, max }: { current: number, min: number, max: number }) => {
    let percent = 50;
    if (max > min) percent = Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100));
    
    const formatNum = (n: number) => {
      if (n > 10000) return (n/10000).toFixed(1) + '만';
      if (n > 1000) return (n/1000).toFixed(1) + 'k';
      return n.toFixed(0);
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', width: '100%', paddingRight: '24px' }}>
        <span style={{ width: '32px', textAlign: 'right' }}>{formatNum(min)}</span>
        <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: `${percent}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 6px rgba(0,208,124,0.45)' }} />
        </div>
        <span style={{ width: '32px' }}>{formatNum(max)}</span>
      </div>
    );
  };

  const isPositive = change1D >= 0;
  const sparkColor = isPositive ? 'var(--success)' : 'var(--danger)';

  // ─── financial_metrics 전용 행 ───────────────────────────────────
  if (item.category === 'financial_metrics') {
    const m = (d.metrics as Record<string,number> | undefined) ?? {};
    const fmt = (v: number | undefined, unit = '') =>
      v != null ? `${v.toFixed(unit === '\uc5ed' ? 0 : unit === '\ubc30' ? 2 : 1)}${unit}` : '-';
    const hintColor = (v: number | undefined, good: number, ok: number, inv = false) => {
      if (v == null) return 'var(--text-muted)';
      const pass = inv ? v < good : v >= good;
      const mid  = inv ? v < ok  : v >= ok;
      return pass ? 'var(--success)' : mid ? 'var(--warning)' : 'var(--danger)';
    };
    return (
      <div
        onClick={onClick}
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 90px',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {/* 회사명 */}
        <div style={{ display:'flex', flexDirection:'column', paddingRight:12, overflow:'hidden' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</span>
          <span style={{ fontSize:11, color:'var(--brand-blue)', fontWeight:600, marginTop:2 }}>{d.ticker ?? ''}</span>
        </div>
        {/* 지표 컬럼들 */}
        {[
          { label:'PER', value: fmt(m.peRatio, '\ubc30'), color: hintColor(m.peRatio, 0, 25, true) },
          { label:'PBR', value: fmt(m.pbr, '\ubc30'),    color: hintColor(m.pbr, 0, 2, true) },
          { label:'ROE', value: m.roe != null ? `${m.roe.toFixed(1)}%` : '-', color: hintColor(m.roe, 15, 8) },
          { label:'ROA', value: m.roa != null ? `${m.roa.toFixed(1)}%` : '-', color: hintColor(m.roa, 8, 4) },
          { label:'\uc601\uc5c5\uc774\uc775\ub960', value: m.operatingMargin != null ? `${m.operatingMargin.toFixed(1)}%` : '-', color: hintColor(m.operatingMargin, 15, 8) },
          { label:'\ubd80\ucc44\ube44\uc728', value: m.debtRatio != null ? `${Math.round(m.debtRatio)}%` : '-', color: hintColor(m.debtRatio, 0, 100, true) },
          { label:'\ub9e4\ucd9c\uc131\uc7a5', value: m.revenueGrowth != null ? `${m.revenueGrowth > 0 ? '+' : ''}${m.revenueGrowth.toFixed(1)}%` : '-', color: hintColor(m.revenueGrowth, 10, 0) },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign:'right', paddingRight:20 }}>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:13, fontWeight:700, color }}>{value}</div>
          </div>
        ))}
        {/* Mini Radar */}
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <MiniRadar m={m} />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 1.2fr 1.2fr 90px',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-secondary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Name & Symbol */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </span>
        {subValue && (
          <span style={{ fontSize: '12px', color: 'var(--brand-blue)', fontWeight: 600, marginTop: '2px' }}>
            {subValue}
          </span>
        )}
      </div>

      {/* Price */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', paddingRight: '24px' }}>
        {mainValue}
      </div>

      {/* Changes */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '24px' }}>{formatChange(change1D)}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '24px' }}>{formatChange(change1M)}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '24px' }}>{formatChange(changeYTD)}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '24px' }}>{formatChange(change1Y)}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '24px' }}>{formatChange(change3Y)}</div>

      {/* Ranges */}
      <RangeBar current={currentValNum} min={dayLow} max={dayHigh} />
      <RangeBar current={currentValNum} min={w52Low} max={w52High} />

      {/* Sparkline */}
      <div style={{ width: '80px', height: '32px', marginLeft: 'auto' }}>
        {sparkData.length > 0 ? (
          <Sparkline data={sparkData} color={sparkColor} />
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Data</span>
        )}
      </div>
    </div>
  );
}
