'use client';

import { type ProcessedData } from '@/lib/types';
import InsightsPanel from './InsightsPanel';
import ChartPanel from './charts/ChartPanel';
import StatsRow from './StatsRow';
import { Star } from 'lucide-react';

interface DataViewerProps {
  data: ProcessedData;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function DataViewer({ data, isFavorite, onToggleFavorite }: DataViewerProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Actions */}
      <div className="flex justify-end items-center mb-2">
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isFavorite ? '#f59e0b' : 'rgba(255,255,255,0.35)',
              fontSize: '13px', fontWeight: 600,
              transition: 'color 0.2s',
              padding: '4px 0',
            }}
            onMouseEnter={e => { if (!isFavorite) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { if (!isFavorite) e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
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
