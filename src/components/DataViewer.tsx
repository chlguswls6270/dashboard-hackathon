'use client';

import { CATEGORY_META, type ProcessedData } from '@/lib/types';
import { CAT_ICONS } from '@/lib/icons';
import InsightsPanel from './InsightsPanel';
import ChartPanel from './charts/ChartPanel';
import StatsRow from './StatsRow';
import { ArrowLeft, ChevronRight, Star } from 'lucide-react';

interface DataViewerProps {
  data: ProcessedData;
  isFavorite?: boolean;
  onBack?: () => void;
  onToggleFavorite?: () => void;
}

export default function DataViewer({ data, isFavorite, onBack, onToggleFavorite }: DataViewerProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Page title */}
      <div className="flex justify-between items-start gap-6" style={{ marginBottom: '10px' }}>
        <div style={{ minWidth: 0 }}>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg transition-colors"
              style={{
                background: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                padding: '4px 0',
                marginBottom: '6px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <ArrowLeft size={16} />
              돌아가기
            </button>
          )}
          <div className="flex items-center gap-1.5 mb-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: CATEGORY_META[data.category]?.color, display: 'flex' }}>
              {CAT_ICONS[data.category]}
            </span>
            <button onClick={onBack} style={{ color: 'var(--text-secondary)' }}>{data.categoryKo}</button>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--accent)' }}>{data.title}</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800, lineHeight: 1.25 }}>
            {data.title}
          </h1>
        </div>
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isFavorite ? '#F59E0B' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600,
              transition: 'color 0.2s',
              padding: '4px 0',
            }}
            onMouseEnter={e => { if (!isFavorite) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (!isFavorite) e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          </button>
        )}
      </div>

      {/* Stats row */}
      <StatsRow data={data} />

      {/* Main chart */}
      <div className="glass" style={{ minHeight: 420, padding: '32px' }}>
        <ChartPanel data={data} />
      </div>

      {/* Insights */}
      <InsightsPanel insights={data.insights} riskLevel={data.riskLevel} />
    </div>
  );
}
