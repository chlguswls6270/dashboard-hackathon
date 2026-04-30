'use client';

import { CATEGORY_META, type CategoryKey, type ProcessedData } from '@/lib/types';
import { CAT_ICONS_SMALL } from '@/lib/icons';
import { Trash2, BarChart2, Home, Download } from 'lucide-react';

interface SidebarProps {
  cachedData: ProcessedData[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onClearCache: () => void;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as CategoryKey[];

export default function Sidebar({ cachedData, activeTab, onSelectTab, onClearCache }: SidebarProps) {
  const categoryCounts = cachedData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<CategoryKey, number>);

  const cachedKeys = new Set(Object.keys(categoryCounts) as CategoryKey[]);
  const totalItems = cachedData.length;

  return (
    <aside className="w-64 flex flex-col h-full border-r" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
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
            <Home size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span className="flex-1 font-medium">홈</span>
          </button>
          <button
            onClick={() => onSelectTab('upload')}
            className={`tab-item w-full text-left transition-all ${activeTab === 'upload' ? 'active' : ''}`}
          >
            <Download size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span className="flex-1 font-medium">데이터 불러오기</span>
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
                <span style={{ color: activeTab === cat ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
                  {CAT_ICONS_SMALL[cat]}
                </span>
                <span className="flex-1">{meta.ko}</span>
                {isCached && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {categoryCounts[cat]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {totalItems > 0 && (
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            총 {totalItems}개 데이터 캐시됨
          </p>
          <button
            onClick={onClearCache}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-red-500/10"
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={12} />
            캐시 초기화
          </button>
        </div>
      )}
    </aside>
  );
}
