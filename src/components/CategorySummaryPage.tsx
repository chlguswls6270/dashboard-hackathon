'use client';

import { useState } from 'react';
import { type ProcessedData, CATEGORY_META, type CategoryKey } from '@/lib/types';
import SummaryRow from './SummaryRow';
import NewsBanner from './NewsBanner';
import { TrendingUp, Layers, PieChart, BarChart, Globe, Landmark, Package, RefreshCw, Bitcoin, Building2, Repeat2, Coins, Zap, BookOpen, Warehouse } from 'lucide-react';

const CAT_ICONS: Record<CategoryKey, React.ReactNode> = {
  stock:             <TrendingUp   size={24} />,
  etf:               <Layers       size={24} />,
  portfolio:         <PieChart     size={24} />,
  financial_metrics: <BarChart     size={24} />,
  market_indicators: <Globe        size={24} />,
  bonds:             <Landmark     size={24} />,
  commodities:       <Package      size={24} />,
  forex:             <RefreshCw   size={24} />,
  crypto:            <Bitcoin      size={24} />,
  macro:             <Building2    size={24} />,
  trade:             <Repeat2      size={24} />,
  dividend:          <Coins        size={24} />,
  derivatives:       <Zap          size={24} />,
  funds:             <BookOpen     size={24} />,
  reits:             <Warehouse    size={24} />,
  dynamic:           <Globe        size={24} />,
};

interface CategorySummaryPageProps {
  category: CategoryKey;
  items: ProcessedData[];
  onSelectItem: (item: ProcessedData) => void;
}

export default function CategorySummaryPage({ category, items, onSelectItem }: CategorySummaryPageProps) {
  const meta = CATEGORY_META[category];
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Artificially group items to create more categories
  const groupedItems = items.reduce((acc, item, index) => {
    const data = item.data as any;
    // Use natural grouping if available, but for demonstration, we force them into chunks of 10
    // so we can show the "View More" functionality
    const naturalGroup = data.sector || data.exchange;
    const groupKey = naturalGroup ? `${naturalGroup} (그룹 ${Math.floor(index / 10) + 1})` : `${meta.ko} 카테고리 ${Math.floor(index / 10) + 1}`;
    
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, ProcessedData[]>);

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
          <span style={{ color: meta.color, display: 'flex' }}>{CAT_ICONS[category]}</span>
          {meta.ko} 요약
        </h2>
        <p style={{ fontSize: '14px', marginTop: '8px', color: 'var(--text-secondary)' }}>
          총 {items.length}개의 데이터가 캐시되어 있습니다. 상세 분석을 보려면 종목을 선택하세요.
        </p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <NewsBanner categoryKey={category} onMockClick={(e) => {
          e.stopPropagation();
          alert('상세 기사 페이지로 이동합니다.');
        }} />
      </div>

      {Object.entries(groupedItems).map(([groupName, groupItems]) => {
        const isExpanded = expandedGroups[groupName];
        const visibleItems = isExpanded ? groupItems : groupItems.slice(0, 5);
        const hasMore = groupItems.length > 5;

        return (
          <div key={groupName} style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid rgba(255,255,255,0.1)',
              paddingBottom: '8px',
              display: 'inline-block'
            }}>
              {groupName}
            </h3>
            <div style={{
              background: 'rgba(20, 27, 45, 0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: category === 'financial_metrics'
                  ? '1.4fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 90px'
                  : '1.2fr 0.8fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 1.2fr 1.2fr 90px',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {category === 'financial_metrics' ? (
                  <>
                    <div>기업명</div>
                    {['PER','PBR','ROE','ROA','영업이익률','부채비율','매출성장'].map(col => (
                      <div key={col} style={{ textAlign:'right', paddingRight:20 }}>{col}</div>
                    ))}
                    <div style={{ textAlign:'right' }}>역량 레이더</div>
                  </>
                ) : (
                  <>
                    <div>Name</div>
                    <div style={{ textAlign: 'right', paddingRight: '24px' }}>Price</div>
                    <div style={{ textAlign: 'right', paddingRight: '24px' }}>Today</div>
                    <div style={{ textAlign: 'right', paddingRight: '24px' }}>1 Month</div>
                    <div style={{ textAlign: 'right', paddingRight: '24px' }}>YTD</div>
                    <div style={{ textAlign: 'right', paddingRight: '24px' }}>1 Year</div>
                    <div style={{ textAlign: 'right', paddingRight: '24px' }}>3 Years</div>
                    <div style={{ textAlign: 'center', paddingRight: '24px' }}>Day Range</div>
                    <div style={{ textAlign: 'center', paddingRight: '24px' }}>52W Range</div>
                    <div style={{ textAlign: 'right' }}>Trend</div>
                  </>
                )}
              </div>

              {/* Table Body */}
              <div>
                {visibleItems.map(item => (
                  <SummaryRow key={item.id} item={item} onClick={() => onSelectItem(item)} />
                ))}
                
                {hasMore && (
                  <div 
                    onClick={() => toggleGroup(groupName)}
                    style={{ 
                      padding: '16px', textAlign: 'center', cursor: 'pointer', 
                      borderTop: '1px solid rgba(255,255,255,0.04)', 
                      color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, 
                      transition: 'all 0.2s', background: 'rgba(255,255,255,0.01)' 
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                    }}
                  >
                    {isExpanded ? '접기 (Collapse)' : `+ ${groupItems.length - 5}개 종목 더보기`}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

    </div>
  );
}
