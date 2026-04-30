'use client';

import { useState, useMemo } from 'react';
import { type ProcessedData } from '@/lib/types';
import { Heart, Bookmark, Share2, TrendingUp, TrendingDown, Search, SlidersHorizontal } from 'lucide-react';
import Sparkline from '@/components/Sparkline';

// 자산 배분 색상
const ALLOC_COLORS: Record<string, string> = {
  '주식': '#6366f1',
  'ETF': '#8b5cf6',
  '채권': '#06b6d4',
  '원자재': '#f59e0b',
  '암호화폐': '#ef4444',
  '외환': '#f97316',
  '리츠': '#22c55e',
  '현금': '#94a3b8',
};

const RISK_META = {
  low:    { label: '안정형', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  medium: { label: '균형형', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high:   { label: '공격형', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

type SortKey = 'returnRate' | 'returnRateAsc' | 'likes' | 'postedAt';
type RiskFilter = 'all' | 'low' | 'medium' | 'high';

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.slice(0, 1);
  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function AllocBar({ alloc }: { alloc: { category: string; weight: number }[] }) {
  return (
    <div style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
      {alloc.map((a) => (
        <div
          key={a.category}
          title={`${a.category} ${a.weight}%`}
          style={{
            flex: a.weight,
            background: ALLOC_COLORS[a.category] ?? '#64748b',
            minWidth: 2,
          }}
        />
      ))}
    </div>
  );
}

function PortfolioCard({ item, onClick }: { item: ProcessedData; onClick: () => void }) {
  const d = item.data as any;
  const returnRate = (d.returnRate as number) ?? 0;
  const isUp = returnRate >= 0;
  const riskMeta = RISK_META[(d.riskLevel as keyof typeof RISK_META) ?? 'medium'];
  const alloc: { category: string; weight: number }[] = d.assetAllocation ?? [];
  const priceHistory: { date: string; value: number }[] = d.performanceHistory ?? [];
  const sparkValues = priceHistory.slice(-30).map((p) => p.value);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(15, 22, 41, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(99,102,241,0.4)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(99,102,241,0.15)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Owner row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={d.ownerName ?? '?'} size={36} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>{d.ownerName ?? '-'}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>@{d.ownerHandle} · {d.postedAt}</p>
          </div>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 8, background: riskMeta.bg, color: riskMeta.color, fontSize: 11, fontWeight: 700 }}>
          {riskMeta.label}
        </div>
      </div>

      {/* Portfolio name + return */}
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 6, lineHeight: 1.4 }}>{item.title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: isUp ? '#ef4444' : '#3b82f6', letterSpacing: '-0.02em' }}>
            {isUp ? '+' : ''}{returnRate.toFixed(2)}%
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>총 수익률</span>
        </div>
      </div>

      {/* 3 stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: '연환산', value: `${d.annualizedReturn ?? '-'}%` },
          { label: '샤프', value: d.sharpeRatio ?? '-' },
          { label: '최대낙폭', value: d.maxDrawdown != null ? `${d.maxDrawdown}%` : '-' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.04em' }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      {sparkValues.length > 2 && (
        <div style={{ height: 48 }}>
          <Sparkline data={sparkValues} color={isUp ? '#ef4444' : '#3b82f6'} height={48} width="100%" />
        </div>
      )}

      {/* Asset allocation bar */}
      {alloc.length > 0 && (
        <div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.04em' }}>자산 배분</p>
          <AllocBar alloc={alloc} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {alloc.slice(0, 4).map(a => (
              <div key={a.category} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ALLOC_COLORS[a.category] ?? '#64748b' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{a.category} {a.weight}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {d.tags && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(d.tags as string[]).map(tag => (
            <span key={tag} style={{ fontSize: 10, color: 'rgba(99,102,241,0.8)', background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Social counts */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          <Heart size={13} />
          <span>{d.likes}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          <Bookmark size={13} />
          <span>{d.bookmarks}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          <Share2 size={13} />
          <span>{d.shareCount}</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          총 {(d.totalValue as number)?.toLocaleString('ko-KR', { maximumFractionDigits: 0 }) ?? '-'}원
        </div>
      </div>
    </div>
  );
}

interface PortfolioFeedPageProps {
  items: ProcessedData[];
  onSelectItem: (item: ProcessedData) => void;
}

export default function PortfolioFeedPage({ items, onSelectItem }: PortfolioFeedPageProps) {
  const [sort, setSort] = useState<SortKey>('returnRate');
  const [risk, setRisk] = useState<RiskFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...items];
    // 검색
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item => {
        const d = item.data as any;
        return (
          item.title?.toLowerCase().includes(q) ||
          d.ownerName?.toLowerCase().includes(q) ||
          d.ownerHandle?.toLowerCase().includes(q) ||
          (d.tags as string[] | undefined)?.some(t => t.toLowerCase().includes(q))
        );
      });
    }
    // 위험도 필터
    if (risk !== 'all') {
      list = list.filter(item => (item.data as any).riskLevel === risk);
    }
    // 정렬
    list.sort((a, b) => {
      const da = a.data as any;
      const db = b.data as any;
      if (sort === 'returnRate') return (db.returnRate ?? 0) - (da.returnRate ?? 0);
      if (sort === 'returnRateAsc') return (da.returnRate ?? 0) - (db.returnRate ?? 0);
      if (sort === 'likes') return (db.likes ?? 0) - (da.likes ?? 0);
      if (sort === 'postedAt') return (db.postedAt ?? '').localeCompare(da.postedAt ?? '');
      return 0;
    });
    return list;
  }, [items, sort, risk, search]);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'returnRate', label: '수익률 높은순' },
    { key: 'returnRateAsc', label: '수익률 낮은순' },
    { key: 'likes', label: '좋아요순' },
    { key: 'postedAt', label: '최신순' },
  ];
  const riskOptions: { key: RiskFilter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'low', label: '안정형' },
    { key: 'medium', label: '균형형' },
    { key: 'high', label: '공격형' },
  ];

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <TrendingUp size={26} color="#6366f1" />
          커뮤니티 포트폴리오
        </h2>
        <p style={{ fontSize: 14, marginTop: 8, color: 'var(--text-secondary)' }}>
          투자자들이 동의하고 공유한 실제 포트폴리오 {items.length}개를 확인하세요.
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap',
        background: 'rgba(15,22,41,0.6)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px 20px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="포트폴리오 / 닉네임 / 태그 검색"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '8px 12px 8px 34px', color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        {/* Risk filter */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
          {riskOptions.map(o => (
            <button
              key={o.key}
              onClick={() => setRisk(o.key)}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: risk === o.key ? 'rgba(99,102,241,0.3)' : 'transparent',
                color: risk === o.key ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={13} color="rgba(255,255,255,0.3)" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '7px 12px', color: 'rgba(255,255,255,0.7)', fontSize: 12, outline: 'none', cursor: 'pointer',
            }}
          >
            {sortOptions.map(o => <option key={o.key} value={o.key} style={{ background: '#0f1629' }}>{o.label}</option>)}
          </select>
        </div>

        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
          {filtered.length}개 표시 중
        </span>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          조건에 맞는 포트폴리오가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map(item => (
            <PortfolioCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      )}
    </div>
  );
}
