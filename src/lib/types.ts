export type CategoryKey =
  | 'stock' | 'etf' | 'portfolio' | 'financial_metrics'
  | 'market_indicators' | 'bonds' | 'commodities' | 'forex'
  | 'crypto' | 'macro' | 'trade' | 'dividend'
  | 'derivatives' | 'funds' | 'reits';

export type ChartType =
  | 'candlestick' | 'line' | 'bar' | 'pie' | 'donut'
  | 'area' | 'scatter' | 'radar' | 'heatmap' | 'histogram';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ProcessedData {
  id: string;
  category: CategoryKey;
  categoryKo: string;
  title: string;
  chartType: ChartType;
  subChartType: ChartType | null;
  summary: string;
  insights: string[];
  riskLevel: RiskLevel;
  timeRange: string;
  data: Record<string, unknown>;
  metadata: {
    rowCount: number;
    currency: string;
    dataSource: string;
    processedAt: string;
  };
}

export const CATEGORY_META: Record<CategoryKey, { ko: string; icon: string; color: string }> = {
  stock:              { ko: '주식',       icon: '📈', color: '#6366f1' },
  etf:                { ko: 'ETF',        icon: '🗂️', color: '#8b5cf6' },
  portfolio:          { ko: '포트폴리오', icon: '💼', color: '#3b82f6' },
  financial_metrics:  { ko: '재무 지표',  icon: '📊', color: '#06b6d4' },
  market_indicators:  { ko: '시장 지표',  icon: '🌐', color: '#10b981' },
  bonds:              { ko: '채권',       icon: '🏛️', color: '#84cc16' },
  commodities:        { ko: '원자재',     icon: '🥇', color: '#eab308' },
  forex:              { ko: '외환',       icon: '💱', color: '#f97316' },
  crypto:             { ko: '암호화폐',   icon: '🪙', color: '#ef4444' },
  macro:              { ko: '경제 지표',  icon: '🏦', color: '#ec4899' },
  trade:              { ko: '거래 내역',  icon: '🔄', color: '#14b8a6' },
  dividend:           { ko: '배당',       icon: '💰', color: '#a855f7' },
  derivatives:        { ko: '파생상품',   icon: '⚡', color: '#f43f5e' },
  funds:              { ko: '펀드',       icon: '📋', color: '#0ea5e9' },
  reits:              { ko: '리츠',       icon: '🏢', color: '#22c55e' },
};

export interface AlertItem {
  id: string;
  name: string;
  targetItemId: string;
  condition: 'above' | 'below';
  targetPrice: number;
  active: boolean;
  createdAt: number;
}
