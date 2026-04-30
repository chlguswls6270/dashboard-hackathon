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
      return null; // 세부 뷰 카드에 모든 지표가 포함되어 있어 중복 제거
    case 'market_indicators': {
      const breadth = (d.breadth as {advancing?:number;declining?:number} | undefined) ?? {};
      const chgPct = (d.changePercent as number) ?? 0;
      stats.push(
        { label: '지수', value: fmt(d.currentValue as number) },
        { label: '등락률', value: `${chgPct > 0 ? '+' : ''}${chgPct}%`, color: changeColor(chgPct) },
        { label: 'VIX', value: d.vix != null ? String(d.vix) : '-' },
        { label: '상승 종목', value: breadth.advancing != null ? String(breadth.advancing) : '-' },
        { label: '하락 종목', value: breadth.declining != null ? String(breadth.declining) : '-' },
      );
      break;
    }
    case 'bonds':
      stats.push(
        { label: '쿠폰금리', value: d.couponRate != null ? `${d.couponRate}%` : '-' },
        { label: '현재 수익률', value: (d.currentYield as number) != null ? `${(d.currentYield as number).toFixed(2)}%` : '-' },
        { label: 'YTM', value: d.yieldToMaturity != null ? `${d.yieldToMaturity}%` : '-' },
        { label: '듀레이션', value: d.duration != null ? `${d.duration}년` : '-' },
        { label: '신용등급', value: (d.creditRating as string) ?? '-' },
      );
      break;
    case 'commodities': {
      const chgC = (d.changePercent as number) ?? 0;
      stats.push(
        { label: '현재가', value: fmt(d.currentPrice as number, '$') },
        { label: '등락률', value: `${chgC > 0 ? '+' : ''}${chgC}%`, color: changeColor(chgC) },
        { label: '단위', value: (d.unit as string) ?? '-' },
      );
      break;
    }
    case 'forex': {
      const chgF = (d.changePercent as number) ?? 0;
      stats.push(
        { label: '환율', value: fmt(d.currentRate as number) },
        { label: '등락률', value: `${chgF > 0 ? '+' : ''}${chgF}%`, color: changeColor(chgF) },
        { label: 'Bid', value: fmt(d.bid as number) },
        { label: 'Ask', value: fmt(d.ask as number) },
        { label: '변동성', value: d.volatility != null ? `${d.volatility}%` : '-' },
      );
      break;
    }
    case 'crypto': {
      const chg24 = (d.change24h as number) ?? 0;
      const chg7 = (d.change7d as number) ?? 0;
      stats.push(
        { label: '현재가', value: fmt(d.currentPrice as number, '$') },
        { label: '24h 등락', value: `${chg24 > 0 ? '+' : ''}${chg24}%`, color: changeColor(chg24) },
        { label: '7d 등락', value: `${chg7 > 0 ? '+' : ''}${chg7}%`, color: changeColor(chg7) },
        { label: '도미넌스', value: d.dominance != null ? `${d.dominance}%` : '-' },
        { label: '시총', value: d.marketCap ? `$${fmt((d.marketCap as number)/1e9, '', 'B')}` : '-' },
      );
      break;
    }
    case 'macro': {
      const ind = (d.indicators as Record<string, number> | undefined) ?? {};
      stats.push(
        { label: 'GDP 성장률', value: ind.gdpGrowth != null ? `${ind.gdpGrowth}%` : '-' },
        { label: 'CPI', value: ind.cpi != null ? `${ind.cpi}%` : '-' },
        { label: '실업률', value: ind.unemploymentRate != null ? `${ind.unemploymentRate}%` : '-' },
        { label: '기준금리', value: ind.baseRate != null ? `${ind.baseRate}%` : '-' },
      );
      break;
    }
    case 'trade': {
      const s = (d.summary as Record<string, number> | undefined) ?? {};
      stats.push(
        { label: '총 거래건수', value: s.totalTrades != null ? `${s.totalTrades}건` : '-' },
        { label: '총 매수', value: fmt(s.totalBuy, '₩') },
        { label: '총 매도', value: fmt(s.totalSell, '₩') },
        { label: '실현손익', value: fmt(s.realizedPnL, '₩'), color: changeColor(s.realizedPnL) },
        { label: '수수료', value: fmt(s.totalFees, '₩') },
      );
      break;
    }
    case 'dividend':
      stats.push(
        { label: '배당수익률', value: d.currentYield != null ? `${d.currentYield}%` : '-' },
        { label: '연간 배당', value: fmt(d.annualDividend as number, '₩') },
        { label: '배당성향', value: d.payoutRatio != null ? `${d.payoutRatio}%` : '-' },
        { label: '배당 성장률', value: d.dividendGrowthRate != null ? `${d.dividendGrowthRate}%` : '-' },
        { label: '연속 지급', value: d.consecutiveYears != null ? `${d.consecutiveYears}년` : '-' },
      );
      break;
    case 'derivatives': {
      const g = (d.greeks as Record<string, number> | undefined) ?? {};
      stats.push(
        { label: '기초자산가', value: fmt(d.underlyingPrice as number) },
        { label: 'Delta', value: g.delta != null ? String(g.delta) : '-' },
        { label: 'Gamma', value: g.gamma != null ? String(g.gamma) : '-' },
        { label: 'Theta', value: g.theta != null ? String(g.theta) : '-' },
        { label: 'Vega', value: g.vega != null ? String(g.vega) : '-' },
      );
      break;
    }
    case 'funds':
      stats.push(
        { label: 'NAV', value: fmt(d.nav as number, '₩') },
        { label: '1년 수익률', value: d.totalReturn1Y != null ? `${d.totalReturn1Y}%` : '-', color: changeColor(d.totalReturn1Y as number) },
        { label: '3년 수익률', value: d.totalReturn3Y != null ? `${d.totalReturn3Y}%` : '-' },
        { label: '5년 수익률', value: d.totalReturn5Y != null ? `${d.totalReturn5Y}%` : '-' },
        { label: '보수', value: d.expenseRatio != null ? `${d.expenseRatio}%` : '-' },
      );
      break;
    case 'reits':
      stats.push(
        { label: '현재가', value: fmt(d.currentPrice as number, '₩') },
        { label: '배당수익률', value: d.distributionYield != null ? `${d.distributionYield}%` : '-' },
        { label: 'FFO', value: fmt(d.ffo as number, '₩') },
        { label: 'NAV/주', value: fmt(d.navPerShare as number, '₩') },
        { label: '임대율', value: d.occupancyRate != null ? `${d.occupancyRate}%` : '-' },
      );
      break;
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
