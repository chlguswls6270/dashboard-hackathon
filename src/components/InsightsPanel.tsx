'use client';

import { Lightbulb } from 'lucide-react';
import type { RiskLevel } from '@/lib/types';

export default function InsightsPanel({ insights, riskLevel }: { insights: string[]; riskLevel: RiskLevel }) {
  return (
    <div className="glass" style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <Lightbulb size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>AI 인사이트</h3>
        <span className={`badge badge-${riskLevel}`} style={{ marginLeft: 'auto' }}>
          {riskLevel === 'low' ? '저위험' : riskLevel === 'medium' ? '중위험' : '고위험'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {insights.map((insight, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 280px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.12)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
