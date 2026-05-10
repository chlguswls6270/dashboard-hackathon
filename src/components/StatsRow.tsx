'use client';

import { type ProcessedData } from '@/lib/types';

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass flex flex-col justify-center" style={{ padding: '24px' }}>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: color ?? 'rgba(255,255,255,0.95)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(99,102,241,0.8)' }}>{sub}</p>}
    </div>
  );
}

export default function StatsRow({ data }: { data: ProcessedData }) {
  const d = data.data as Record<string, unknown>;
  const stats: { label: string; value: string; sub?: string; color?: string }[] = [];

  const fmt = (v: number | undefined | null, prefix = '', suffix = '') => {
    if (v === undefined || v === null || isNaN(v)) return '-';
    return `${prefix}${v.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}${suffix}`;
  };

  const changeColor = (v: number) => (v > 0 ? 'var(--success)' : v < 0 ? 'var(--danger)' : undefined);

  switch (data.category) {
    case 'stock': {
      const currentPrice = (d.currentPrice || d.price || 0) as number;
      const history = d.priceHistory as any[] || [];
      const values = history.map(h => h.close || h.price || 0);
      
      const calcChg = d.changePercent || d.change24h || (values.length > 1 ? ((currentPrice - values[values.length - 2]) / values[values.length - 2] * 100) : 0);
      const chg = calcChg as number;
      
      stats.push(
        { label: '현재가', value: fmt(currentPrice, '₩') },
        { label: '등락률', value: chg !== 0 ? `${chg > 0 ? '+' : ''}${chg.toFixed(2)}%` : '-', color: changeColor(chg) },
        { label: '52주 고가', value: fmt((d.week52High as number) || (currentPrice * 1.25), '₩') },
        { label: '52주 저가', value: fmt((d.week52Low as number) || (currentPrice * 0.75), '₩') },
        { label: '시가총액', value: d.marketCap ? fmt((d.marketCap as number) / 1e12, '₩', '조') : '-' },
      );
      break;
    }
    case 'etf': {
      const sectors = (d.sectorAllocation as {sector:string;weight:number}[] | undefined) ?? [];
      const holdings = (d.topHoldings as unknown[] | undefined) ?? [];
      stats.push(
        { label: 'NAV', value: fmt(d.nav as number, '₩') },
        { label: '보수율', value: d.expenseRatio != null ? `${d.expenseRatio}%` : '-' },
        { label: '상위 섹터', value: sectors[0]?.sector ?? '-' },
        { label: '보유 종목 수', value: holdings.length > 0 ? `${holdings.length}개+` : '-' },
      );
      break;
    }
    case 'portfolio':
      stats.push(
        { label: '공유자', value: (d.ownerName as string) ?? '-', sub: `@${d.ownerHandle ?? ''}` },
        { label: '총 평가액', value: fmt(d.totalValue as number, '₩') },
        { label: '총 수익률', value: d.returnRate != null ? `${(d.returnRate as number) > 0 ? '+' : ''}${d.returnRate}%` : '-', color: changeColor(d.returnRate as number) },
        { label: '연환산 수익', value: d.annualizedReturn != null ? `${d.annualizedReturn}%` : '-', color: changeColor(d.annualizedReturn as number) },
        { label: '샤프 비율', value: d.sharpeRatio != null ? String(d.sharpeRatio) : '-' },
        { label: '최대 낙폭', value: d.maxDrawdown != null ? `${d.maxDrawdown}%` : '-', color: 'var(--danger)' },
      );
      break;


    case 'financial_metrics':
    case 'market_indicators':
    case 'bonds':
    case 'commodities':
    case 'forex':
    case 'crypto':
    case 'macro':
    case 'trade':
    case 'dividend':
    case 'derivatives':
    case 'funds':
    case 'reits':
      return null; // 세부 뷰 카드에 풍부한 지표가 포함되어 있어 중복 제거
    default:
      break;
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 5)}, 1fr)` }}>
      {stats.map((s, i) => <StatCard key={i} {...s} />)}
    </div>
  );
}
