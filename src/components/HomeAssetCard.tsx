'use client';

import { type ProcessedData } from '@/lib/types';
import Sparkline from './Sparkline';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface HomeAssetCardProps {
  item: ProcessedData;
  onClick: () => void;
}

export default function HomeAssetCard({ item, onClick }: HomeAssetCardProps) {
  const hist = item.data.priceHistory || item.data.history || item.data.yieldHistory || item.data.navHistory;

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
  } else if (item.data.totalValue && item.data.returnRate !== undefined) {
    chartData = Array.from({ length: 30 }, (_, i) => item.data.totalValue * (1 + (i - 15) * 0.01));
  }

  const currentVal = item.data.currentPrice || item.data.currentValue || item.data.currentYield || item.data.currentRate || item.data.nav || item.data.totalValue;
  const changePct  = item.data.changePercent || item.data.change24h || item.data.returnRate;

  const isPositive = changePct >= 0;
  const color = isPositive ? '#10b981' : '#ef4444';

  const prefix =
    item.data.unit?.includes('USD') || item.category === 'crypto' || item.category === 'forex' ? '$'
    : item.category === 'stock' || item.category === 'etf' || item.category === 'reits' ? '₩'
    : '';
  const suffix =
    item.category === 'bonds' || item.category === 'macro' || item.category === 'dividend' ? '%' : '';

  const formatVal = (val: number) => {
    if (val === undefined || isNaN(val)) return 'N/A';
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
        padding: '28px',
        overflow: 'visible',
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      }}
      onMouseEnter={e => { e.currentTarget.style.zIndex = '50'; }}
      onMouseLeave={e => { e.currentTarget.style.zIndex = '1'; }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {item.categoryKo}
            </span>
          </div>
          <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs opacity-60 mt-0.5 line-clamp-1">
            {item.data.ticker || item.data.symbol || item.data.pair || 'Market Asset'}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5" style={{ color }}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>

      <div className="flex items-end justify-between mt-auto" style={{ gap: '8px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="text-2xl font-black tabular-nums tracking-tight mb-1">
            {prefix}{formatVal(currentVal)}{suffix}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color }}>
            <span>{isPositive ? '+' : ''}{changePct !== undefined ? changePct.toFixed(2) : '0.00'}%</span>
          </div>
        </div>

        <div className="opacity-80 group-hover:opacity-100 transition-opacity" style={{ flexShrink: 0, overflow: 'visible', position: 'relative', zIndex: 10 }}>
          {chartData.length > 0 ? (
            <Sparkline
              data={chartData}
              color={color}
              width={90}
              height={50}
              dates={chartDates.length > 0 ? chartDates : undefined}
              prefix={prefix}
              suffix={suffix}
            />
          ) : (
            <div className="w-[90px] h-[50px] flex items-center justify-center text-xs opacity-30">
              <Activity size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
