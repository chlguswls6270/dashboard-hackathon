'use client';

import { type ProcessedData } from '@/lib/types';
import { Calendar, FileText, Search } from 'lucide-react';
import Sparkline from './Sparkline';

interface SearchResultsDashboardProps {
  items: ProcessedData[];
  onSelectItem: (item: ProcessedData) => void;
  query: string;
}

type DataRecord = Record<string, unknown>;
type HistoryPoint = DataRecord;

function getSparkData(item: ProcessedData): number[] {
  const d = item.data as DataRecord;
  const history = d.priceHistory || d.history || d.performanceHistory || d.yieldHistory || d.navHistory || [];
  if (Array.isArray(history)) {
    return history
      .map((point: HistoryPoint) => point.close || point.price || point.value || point.rate || point.yield || point.nav)
      .filter((value: unknown): value is number => typeof value === 'number')
      .slice(-30);
  }
  return [];
}

function getTicker(item: ProcessedData) {
  const d = item.data as DataRecord;
  const value = d.ticker || d.symbol || d.pair || d.fundCode;
  return typeof value === 'string' || typeof value === 'number' ? String(value) : item.categoryKo;
}

export default function SearchResultsDashboard({ items, onSelectItem, query }: SearchResultsDashboardProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-up text-center p-10">
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          border: '1px solid var(--border)',
        }}>
          <Search size={32} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          검색 결과가 없습니다
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: 400 }}>
          &apos;{query}&apos; 검색어에 대한 데이터가 존재하지 않습니다. 다른 검색어로 시도해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }} className="gradient-text">검색 결과</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          &apos;{query}&apos;에 대한 분석 결과 {items.length}개를 확인하세요.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {items.map(item => {
          const sparkData = getSparkData(item);
          const dateStr = new Date(item.metadata.processedAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                position: 'relative',
                boxShadow: 'var(--shadow-card)',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                e.currentTarget.style.borderColor = 'rgba(0,208,124,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,208,124,0.10), rgba(0,122,255,0.08))',
                padding: '28px 20px 18px',
                minHeight: '170px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: 'var(--brand-green-soft)',
                    color: 'var(--brand-green-dark)',
                    border: '1px solid rgba(0,208,124,0.25)',
                  }}>
                    {item.categoryKo}
                  </span>
                </div>

                {sparkData.length > 1 ? (
                  <Sparkline data={sparkData} color="var(--brand-blue)" width="100%" height={92} />
                ) : (
                  <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>
                    <FileText size={44} />
                  </div>
                )}
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--brand-blue)', fontWeight: 700, marginBottom: '6px' }}>
                    {getTicker(item)}
                  </p>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.summary}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', marginTop: 'auto' }}>
                  <Calendar size={12} />
                  <span>{dateStr}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
