'use client';

import { CATEGORY_META, type CategoryKey, type ProcessedData } from '@/lib/types';
import { CAT_ICONS_SMALL } from '@/lib/icons';
import { BarChart2, Home, Download } from 'lucide-react';

interface SidebarProps {
  cachedData: ProcessedData[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_META).filter(c => c !== 'dynamic') as CategoryKey[];

export default function Sidebar({ cachedData, activeTab, onSelectTab }: SidebarProps) {
  const categoryCounts = cachedData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<CategoryKey, number>);

  const cachedKeys = new Set(Object.keys(categoryCounts) as CategoryKey[]);
  const totalItems = cachedData.length;

  return (
    <aside className="w-56 flex flex-col h-full border-r" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div
        style={{
          height: '80px',
          minHeight: '80px',
          padding: '0 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <BarChart2 size={22} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontWeight: 800, fontSize: '18px' }} className="gradient-text">모아차트</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '32px', letterSpacing: '0.01em' }}>AI 투자 데이터 대시보드</p>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-0.5 mb-4">
          <button
            onClick={() => onSelectTab('home')}
            className={`tab-item w-full text-left transition-all ${activeTab === 'home' ? 'active' : ''}`}
          >
            <Home size={15} style={{ color: 'currentColor', flexShrink: 0 }} />
            <span className="tab-label flex-1 font-medium">홈</span>
          </button>
          <button
            onClick={() => onSelectTab('upload')}
            className={`tab-item w-full text-left transition-all ${activeTab === 'upload' ? 'active' : ''}`}
          >
            <Download size={15} style={{ color: 'currentColor', flexShrink: 0 }} />
            <span className="tab-label flex-1 font-medium">데이터 불러오기</span>
          </button>
          <button
            onClick={() => onSelectTab('uploaded')}
            className={`tab-item w-full text-left transition-all ${activeTab === 'uploaded' ? 'active' : ''}`}
          >
            <BarChart2 size={15} style={{ color: 'currentColor', flexShrink: 0 }} />
            <span className="tab-label flex-1 font-medium">내가 올린 데이터</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 8px 12px' }} />

        <div className="flex flex-col gap-0.5">
          {ALL_CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat];
            const isCached = cachedKeys.has(cat);
            return (
              <button
                key={cat}
                onClick={() => isCached && onSelectTab(cat)}
                disabled={!isCached}
                className={`tab-item w-full text-left transition-all ${activeTab === cat ? 'active' : ''} ${!isCached ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <span style={{ color: 'currentColor', flexShrink: 0, display: 'flex' }}>
                  {CAT_ICONS_SMALL[cat]}
                </span>
                <span className="tab-label flex-1">{meta.ko}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {totalItems > 0 && (
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            총 {totalItems}개 데이터 캐시됨
          </p>
        </div>
      )}
    </aside>
  );
}
