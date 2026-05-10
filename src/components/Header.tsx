'use client';

import { CATEGORY_META, type ProcessedData } from '@/lib/types';
import { CAT_ICONS } from '@/lib/icons';
import { ChevronRight, ArrowLeft, Clock, Database, Search, User } from 'lucide-react';

export default function Header({ activeData, onBack, userName, onUserClick, searchQuery, onSearch }: { activeData: ProcessedData | null, onBack?: () => void, userName?: string | null, onUserClick?: () => void, searchQuery?: string, onSearch?: (query: string) => void }) {
  return (
    <header className="flex items-center justify-between px-6 border-b gap-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', padding: '16px 28px' }}>
      {activeData ? (
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/5 mr-1 transition-colors">
              <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
          )}
          <span className="text-2xl" style={{ color: CATEGORY_META[activeData.category]?.color, display: 'flex' }}>
            {CAT_ICONS[activeData.category]}
          </span>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <button onClick={onBack} className="hover:text-white transition-colors">{activeData.categoryKo}</button>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--accent)' }}>{activeData.title}</span>
            </div>
            <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{activeData.title}</h1>
          </div>
        </div>
      ) : (
        <div className="shrink-0 hidden sm:block w-1" />
      )}

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, left: 0, paddingLeft: '14px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Search size={16} style={{ color: 'rgba(255,255,255,0.28)' }} />
          </div>
          <input
            type="text"
            placeholder="심볼, 애널리스트, 키워드 검색..."
            value={searchQuery ?? ''}
            onChange={(e) => onSearch?.(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              padding: '11px 18px 11px 42px',
              fontSize: '13px',
              color: 'white',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(99,102,241,0.6)';
              e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {activeData && (
          <>
            <span className={`badge badge-${activeData.riskLevel}`}>
              {activeData.riskLevel === 'low' ? '저위험' : activeData.riskLevel === 'medium' ? '중위험' : '고위험'}
            </span>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Database size={12} />
              {activeData.metadata.dataSource}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock size={12} />
              {new Date(activeData.metadata.processedAt).toLocaleTimeString('ko-KR')}
            </div>
          </>
        )}
        
        {/* User Profile Button */}
        {userName && (
          <button 
            onClick={onUserClick}
            style={{ paddingRight: '8px' }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <User size={16} />
            </div>
            <span className="text-sm font-semibold hidden md:block">{userName}</span>
          </button>
        )}
      </div>
    </header>
  );
}
