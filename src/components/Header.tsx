'use client';

import { type ProcessedData } from '@/lib/types';
import { Clock, Database, Search, User } from 'lucide-react';

export default function Header({ activeData, userName, onUserClick, searchQuery, onSearch }: { activeData: ProcessedData | null, onBack?: () => void, userName?: string | null, onUserClick?: () => void, searchQuery?: string, onSearch?: (query: string) => void }) {
  return (
    <header
      className="flex items-center justify-between px-6 border-b gap-6"
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border)',
        height: '80px',
        minHeight: '80px',
        padding: '0 48px',
        flexShrink: 0,
      }}
    >
      <div className="shrink-0 hidden sm:block w-1" />

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, left: 0, paddingLeft: '14px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <input
            type="text"
            placeholder="심볼, 애널리스트, 키워드 검색..."
            value={searchQuery ?? ''}
            onChange={(e) => onSearch?.(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              padding: '11px 18px 11px 42px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(0,208,124,0.6)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,208,124,0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* User Profile Button */}
        {userName && (
          <button 
            onClick={onUserClick}
            style={{ paddingRight: '8px', border: '1px solid var(--border)', borderRadius: '9999px', padding: '4px 12px 4px 4px', background: 'var(--bg-secondary)', transition: 'all 0.15s' }}
            className="flex items-center gap-2"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,208,124,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #00D07C, #007AFF)' }}>
              <User size={16} />
            </div>
            <span className="text-sm font-semibold hidden md:block" style={{ color: 'var(--text-primary)' }}>{userName}</span>
          </button>
        )}
      </div>
    </header>
  );
}
