'use client';

import { type ProcessedData } from '@/lib/types';
import Sparkline from './Sparkline';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface HomeAssetCardProps {
  item: ProcessedData;
  onClick: () => void;
}

export default function HomeAssetCard({ item, onClick }: HomeAssetCardProps) {
  const d = item.data as any;
  const hist = d.priceHistory || d.history || d.yieldHistory || d.navHistory || d.dividendHistory || d.optionChain || [];
  let chartData: number[] = [];
  let chartDates: string[] = [];

  if (hist && Array.isArray(hist)) {
    const slice = hist.slice(-30);
    chartData  = slice.map((d: any) => d.close || d.price || d.value || d.yield || d.rate || d.nav || 0);
    chartDates = slice.map((d: any) => {
      const raw = d.date || d.timestamp || d.time;
      if (!raw) return '';
      const dt = new Date(raw);
      return isNaN(dt.getTime()) ? raw : dt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    });
  } else if (d.totalValue && d.returnRate !== undefined) {
    chartData = Array.from({ length: 30 }, (_, i) => d.totalValue * (1 + (i - 15) * 0.01));
  }

  const currentVal = d.currentPrice || d.currentValue || d.currentYield || d.currentRate || d.nav || d.totalValue;
  const changePct  = d.changePercent || d.change24h || d.returnRate;

  const isPositive = changePct >= 0;
  const color = isPositive ? 'var(--success)' : 'var(--danger)';

  const prefix =
    d.unit?.includes('USD') || item.category === 'crypto' || item.category === 'forex' ? '$'
    : item.category === 'stock' || item.category === 'etf' || item.category === 'reits' ? '₩'
    : '';
  const suffix =
    item.category === 'bonds' || item.category === 'macro' || item.category === 'dividend' ? '%' : '';

  const formatVal = (val: number) => {
    if (val === undefined || isNaN(val)) return 'N/A';
    if (val >= 1_000_000_000_000) return `${(val / 1_000_000_000_000).toFixed(1)}T`;
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 100_000) return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (val > 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div
      onClick={onClick}
      className="glass rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between"
      style={{
        borderColor: 'var(--border)',
        minHeight: '160px',
        padding: '26px',
        overflow: 'visible',
        position: 'relative',
        zIndex: 1,
        background: '#FFFFFF',
      }}
      onMouseEnter={e => { e.currentTarget.style.zIndex = '50'; }}
      onMouseLeave={e => { e.currentTarget.style.zIndex = '1'; }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: 'var(--brand-green-soft)', color: 'var(--brand-green-dark)' }}>
              {item.categoryKo}
            </span>
          </div>
          <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {item.title}
          </h3>
        </div>

        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isPositive ? 'rgba(0,208,124,0.1)' : 'rgba(255,77,77,0.1)', color }}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>

      <div
        className="mt-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 88px',
          alignItems: 'end',
          columnGap: '10px',
        }}
      >
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div
            className="font-black tabular-nums mb-1"
            style={{
              fontSize: 'clamp(22px, 2vw, 26px)',
              lineHeight: 1,
              letterSpacing: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {prefix}{formatVal(currentVal)}{suffix}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color }}>
            <span>{isPositive ? '+' : ''}{changePct !== undefined ? changePct.toFixed(2) : '0.00'}%</span>
          </div>
        </div>

        <div
          className="opacity-90 group-hover:opacity-100 transition-opacity"
          style={{
            flexShrink: 0,
            overflow: 'visible',
            position: 'relative',
            zIndex: 10,
            borderRadius: '12px',
            padding: '5px 4px',
            background: isPositive ? 'rgba(0,208,124,0.04)' : 'rgba(255,77,77,0.04)',
            width: '88px',
            height: '56px',
          }}
        >
          {chartData.length > 0 ? (
            <Sparkline
              data={chartData}
              color={color}
              width="100%"
              height="100%"
              dates={chartDates.length > 0 ? chartDates : undefined}
              prefix={prefix}
              suffix={suffix}
              interactive
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs opacity-30">
              <Activity size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
