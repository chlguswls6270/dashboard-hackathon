'use client';

import { type ProcessedData } from '@/lib/types';
import Sparkline from './Sparkline';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function SummaryCard({ item, onClick }: { item: ProcessedData; onClick: () => void }) {
  const d = item.data as any;

  let mainValue = '-';
  let subValue = '';
  let changePercent = 0;
  let sparkData: number[] = [];

  try {
    if (item.category === 'stock' || item.category === 'crypto' || item.category === 'commodities') {
      mainValue = item.category === 'stock' ? `₩${d.currentPrice?.toLocaleString()}` : `$${d.currentPrice?.toLocaleString()}`;
      changePercent = d.changePercent || d.change24h || 0;
      sparkData = d.priceHistory?.map((h: any) => h.close || h.price).slice(-30) || [];
      subValue = d.ticker || d.symbol || '';
    } else if (item.category === 'etf' || item.category === 'funds') {
      mainValue = `₩${d.nav?.toLocaleString()}`;
      sparkData = d.priceHistory?.map((h: any) => h.price).slice(-30) || d.navHistory?.map((h: any) => h.nav).slice(-30) || [];
      subValue = d.ticker || d.fundCode || '';
    } else if (item.category === 'portfolio') {
      mainValue = `₩${(d.totalValue / 10000).toFixed(0)}만`;
      changePercent = d.returnRate || 0;
      sparkData = d.performanceHistory?.map((h: any) => h.value).slice(-30) || [];
    } else if (item.category === 'market_indicators') {
      mainValue = d.currentValue?.toLocaleString();
      changePercent = d.changePercent || 0;
      sparkData = d.history?.map((h: any) => h.value).slice(-30) || [];
    } else if (item.category === 'forex') {
      mainValue = d.currentRate?.toLocaleString();
      changePercent = d.changePercent || 0;
      sparkData = d.history?.map((h: any) => h.rate).slice(-30) || [];
    } else if (item.category === 'bonds') {
      mainValue = `${d.currentYield}%`;
      sparkData = d.yieldHistory?.map((h: any) => h.yield).slice(-30) || [];
    }
  } catch (e) {
    console.error('Error parsing summary card data', e);
  }

  const isPositive = changePercent >= 0;
  const color = isPositive ? '#10b981' : '#ef4444';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(20, 27, 45, 0.85)',
        backdropFilter: 'blur(16px)',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '120px',
        width: '100%',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(99, 102, 241, 0.45)';
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 12px 36px rgba(99,102,241,0.14), 0 0 0 1px rgba(99,102,241,0.1)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(255,255,255,0.08)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{
            fontWeight: 700, fontSize: '15px', marginBottom: '4px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '160px', color: 'rgba(255,255,255,0.92)',
          }}>
            {item.title}
          </h3>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>
            {subValue || item.categoryKo}
          </p>
        </div>
        {sparkData.length > 0 && (
          <div style={{ flexShrink: 0, marginLeft: '8px' }}>
            <Sparkline data={sparkData} color={color} />
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <p style={{ fontSize: '18px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.5px' }}>
          {mainValue}
        </p>
        {changePercent !== 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', fontWeight: 700,
            color, background: `${color}18`,
            padding: '4px 10px', borderRadius: '8px',
          }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(changePercent)}%
          </div>
        )}
      </div>
    </button>
  );
}
