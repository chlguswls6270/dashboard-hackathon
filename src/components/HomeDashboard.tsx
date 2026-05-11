'use client';

import { useState, useRef } from 'react';
import { type ProcessedData } from '@/lib/types';
import HomeAssetCard from './HomeAssetCard';
import NewsBanner from './NewsBanner';
import { Newspaper, Lightbulb, TrendingUp, AlertCircle, ChevronLeft, ChevronRight, Flame, ArrowUpRight, ArrowDownRight, Volume2 } from 'lucide-react';

interface HomeDashboardProps {
  cachedData: ProcessedData[];
  onSelectItem: (item: ProcessedData) => void;
  onSelectTab: (tab: string) => void;
}

const ITEMS_PER_PAGE = 5;

const ALL_NEWS = [
  // Page 1
  { id: 1,  title: 'AI 반도체 수요 급증... 엔비디아 또 최고치 경신',             time: '10분 전',  source: '글로벌경제' },
  { id: 2,  title: '미 연준, 기준금리 동결 결정... 시장은 "예상대로"',           time: '1시간 전', source: '파이낸스뉴스' },
  { id: 3,  title: '테슬라 자율주행 V12 업데이트 배포 시작',                     time: '2시간 전', source: '오토데일리' },
  { id: 4,  title: '비트코인 1억 돌파 후 숨고르기... 다음 향방은?',              time: '3시간 전', source: '크립토투데이' },
  { id: 5,  title: '애플, 자체 AI 모델 "Apple Intelligence" 공개 임박',         time: '5시간 전', source: '테크인사이더' },
  // Page 2
  { id: 6,  title: '국제 유가 하락세 전환... 중동 리스크 완화 조짐',            time: '6시간 전', source: '이코노미리포트' },
  { id: 7,  title: '삼성전자 2분기 실적 서프라이즈... 반도체 회복 신호탄',       time: '7시간 전', source: '매일경제' },
  { id: 8,  title: '중국 경기 부양책 발표... 글로벌 증시 동반 상승',             time: '8시간 전', source: '한국경제' },
  { id: 9,  title: '달러 약세 지속... 원화 강세 전환 임박?',                     time: '9시간 전', source: '연합뉴스' },
  { id: 10, title: 'POSCO홀딩스, 2차전지 소재 공장 착공... 주가 급등',          time: '10시간 전', source: '이데일리' },
  // Page 3
  { id: 11, title: '미국 고용지표 예상치 상회... 경기침체 우려 완화',            time: '11시간 전', source: '블룸버그' },
  { id: 12, title: '카카오 AI 부문 분사 추진... 기업가치 재평가 기대',           time: '12시간 전', source: '조선비즈' },
  { id: 13, title: '유럽 ECB 금리 인하 시사... 채권 시장 급등',                 time: '13시간 전', source: '파이낸셜타임스' },
  { id: 14, title: '현대차 전기차 판매 글로벌 3위 달성... 목표 상향',            time: '14시간 전', source: '모터트렌드' },
  { id: 15, title: '국내 부동산 PF 리스크 완화... 은행주 동반 상승',             time: '15시간 전', source: '머니투데이' },
  // Page 4
  { id: 16, title: '네이버, 검색 AI 전면 도입... 구글 대항마 될까',              time: '16시간 전', source: '지디넷코리아' },
  { id: 17, title: '금 현물 사상 최고가 경신... 안전자산 수요 집중',             time: '17시간 전', source: '연합인포맥스' },
  { id: 18, title: '토스뱅크 IPO 추진 공식화... 기업가치 5조 원 목표',           time: '18시간 전', source: '서울경제' },
  { id: 19, title: '전기차 충전 인프라 투자 확대... 관련주 급부상',              time: '20시간 전', source: '에너지경제' },
  { id: 20, title: '코스피 2,800선 안착 성공... 연기금 순매수 지속',             time: '21시간 전', source: '한국거래소' },
];

const ALL_ANALYSIS = [
  // Page 1
  { id: 1,  title: 'AI 메가트렌드: 다음 수혜주는 누가 될 것인가?',              author: '김투자 수석연구원',   type: '섹터 분석' },
  { id: 2,  title: '하반기 금리 인하 사이클 진입 시나리오 점검',                author: '박매크로 애널리스트', type: '거시경제' },
  { id: 3,  title: '저평가 가치주 탐색: 배당 수익률 상위 10선',                 author: '이배당 연구위원',     type: '전략' },
  { id: 4,  title: '배터리 3사 1분기 실적 프리뷰: 바닥을 다지는 중',            author: '최에너지 연구원',     type: '기업 분석' },
  { id: 5,  title: '글로벌 리츠(REITs) 시장 반등 가능성 진단',                  author: '정부동산 수석',       type: '대체투자' },
  // Page 2
  { id: 6,  title: '달러 약세와 신흥국 자산: 지금이 매수 타이밍인가',           author: '오환율 수석',         type: '환율·외환' },
  { id: 7,  title: '반도체 사이클 정점론 vs 재도약론: 팩트로 검증',              author: '김반도체 연구원',     type: '섹터 분석' },
  { id: 8,  title: '코스피 3,000 재돌파 조건 3가지',                             author: '박주식 애널리스트',   type: '시장 전략' },
  { id: 9,  title: '인플레이션 완화 사이클에서 살아남는 채권 포트폴리오',        author: '이채권 연구위원',     type: '채권' },
  { id: 10, title: '원자재 슈퍼사이클 2.0: 농산물·희토류 주목',                  author: '최원자재 분석가',     type: '원자재' },
  // Page 3
  { id: 11, title: '2025년 하반기 주목해야 할 글로벌 ETF TOP 5',                 author: '정ETF 수석',          type: 'ETF 분석' },
  { id: 12, title: '중국 소비 회복 시나리오: 수혜 업종 가이드',                  author: '강중국 애널리스트',   type: '해외 시장' },
  { id: 13, title: '헬스케어 섹터 재평가: 고령화 수혜 종목 선별',               author: '윤바이오 연구원',     type: '기업 분석' },
  { id: 14, title: '가상자산 규제 명확화 이후: 기관 자금 유입 전망',             author: '한크립토 분석가',     type: '크립토' },
  { id: 15, title: '배당 성장주 vs 고배당주: 장기 수익률 비교 분석',             author: '송배당 수석',         type: '전략' },
  // Page 4
  { id: 16, title: '2차전지 소재주: 리튬·망간·코발트 가격 전망',                 author: '권에너지 연구원',     type: '원자재' },
  { id: 17, title: '공모주 시장 2025: 빅딜 IPO 캘린더 총정리',                   author: '허IPO 수석',          type: '공모주' },
  { id: 18, title: '은행주 배당 투자 전략: 금리 인하기 매수 타이밍',             author: '채은행 애널리스트',   type: '배당' },
  { id: 19, title: '미국 빅테크 실적 시즌 프리뷰: 어닝 서프라이즈 가능성',       author: '고빅테크 연구위원',   type: '해외 시장' },
  { id: 20, title: '부동산 간접투자 완벽 가이드: 리츠·부동산펀드 비교',          author: '나부동산 분석가',     type: '대체투자' },
];

const TOTAL_PAGES = ALL_NEWS.length / ITEMS_PER_PAGE; // = 4

// ── Shared sub-components ─────────────────────────────────────

const cardSectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '24px 28px',
  display: 'flex',
  flexDirection: 'column',
};

function PageButtons({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            width: '28px', height: '28px', borderRadius: '8px',
            border: page === p ? '1px solid rgba(0,208,124,0.5)' : '1px solid var(--border)',
            background: page === p ? 'rgba(0,208,124,0.12)' : 'transparent',
            color: page === p ? '#008F55' : 'var(--text-muted)',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.18s',
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function ListItem({ rank, onClick, children }: { rank: number; onClick: React.MouseEventHandler<HTMLButtonElement>; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        padding: '11px 10px', borderRadius: '12px', textAlign: 'left',
        background: 'transparent', border: 'none', cursor: 'pointer',
        transition: 'background 0.18s', width: '100%',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-secondary)',
        fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)',
      }}>
        {rank}
      </div>
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────

export default function HomeDashboard({ cachedData, onSelectItem, onSelectTab }: HomeDashboardProps) {
  const [showMockAlert, setShowMockAlert] = useState(false);
  const [newsPage, setNewsPage] = useState(1);
  const [analysisPage, setAnalysisPage] = useState(1);

  // Pick up to 2 items from each category for variety, total up to 12
  const PREFERRED_CATS = ['stock', 'crypto', 'etf', 'forex', 'commodities', 'market_indicators', 'bonds', 'portfolio', 'reits', 'macro', 'dividend', 'funds'];
  const hotItems = (() => {
    const byCategory: Record<string, typeof cachedData> = {};
    for (const item of cachedData) {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    }
    const result: typeof cachedData = [];
    for (const cat of PREFERRED_CATS) {
      const items = byCategory[cat] || [];
      result.push(...items.slice(0, 2));
      if (result.length >= 12) break;
    }
    return result.slice(0, 12);
  })();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -520 : 520, behavior: 'smooth' });
  };

  const handleMockClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMockAlert(true);
    setTimeout(() => setShowMockAlert(false), 3000);
  };

  const pagedNews = ALL_NEWS.slice((newsPage - 1) * ITEMS_PER_PAGE, newsPage * ITEMS_PER_PAGE);
  const pagedAnalysis = ALL_ANALYSIS.slice((analysisPage - 1) * ITEMS_PER_PAGE, analysisPage * ITEMS_PER_PAGE);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

      {/* ── Page Title ── */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          투데이 인사이트
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          시장의 핵심 동향과 주요 지표를 한눈에 파악하세요
        </p>
      </div>

      {/* ── Hero News Banner ── */}
      <NewsBanner onMockClick={handleMockClick} />

      {/* ── Hot Assets Carousel ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontWeight: 700, fontSize: '17px' }}>주요 시장 지표</h3>
        </div>

        {hotItems.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => scroll('left')} style={navBtnStyle('left')}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>
              <ChevronLeft size={18} />
            </button>

            <div ref={scrollRef} className="hide-scrollbar" style={{
              display: 'flex', gap: '16px',
              overflowX: 'auto', paddingBottom: '8px',
              paddingTop: '10px', marginTop: '-10px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}>
              {hotItems.map(item => (
                <div key={item.id} style={{ flexShrink: 0, width: '300px', scrollSnapAlign: 'start' }}>
                  <HomeAssetCard item={item} onClick={() => onSelectItem(item)} />
                </div>
              ))}
            </div>

            <button onClick={() => scroll('right')} style={navBtnStyle('right')}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div style={{
            padding: '48px 24px', border: '1px dashed var(--border-light)',
            borderRadius: '16px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          }}>
            <AlertCircle style={{ color: 'var(--text-muted)' }} size={28} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>아직 캐시된 데이터가 없습니다.</p>
            <button onClick={() => onSelectTab('upload')} style={{
              background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', borderRadius: '10px',
              padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              데이터 불러오기
            </button>
          </div>
        )}
      </section>

      {/* ── Analysis + News ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* ── Analysis ── */}
        <section style={cardSectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lightbulb size={18} style={{ color: '#fbbf24' }} />
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>인사이트 &amp; 분석</h3>
            </div>
            <PageButtons page={analysisPage} total={TOTAL_PAGES} onChange={setAnalysisPage} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            {pagedAnalysis.map((item, i) => (
              <ListItem key={item.id} rank={(analysisPage - 1) * ITEMS_PER_PAGE + i + 1} onClick={handleMockClick}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.title}</p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', alignItems: 'center' }}>
                    <span style={{ background: 'var(--bg-secondary)', borderRadius: '4px', padding: '1px 6px' }}>{item.type}</span>
                    <span>{item.author}</span>
                  </div>
                </div>
              </ListItem>
            ))}
          </div>
        </section>

        {/* ── News ── */}
        <section style={cardSectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Newspaper size={18} style={{ color: '#60a5fa' }} />
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>최신 주요 뉴스</h3>
            </div>
            <PageButtons page={newsPage} total={TOTAL_PAGES} onChange={setNewsPage} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            {pagedNews.map((item, i) => (
              <ListItem key={item.id} rank={(newsPage - 1) * ITEMS_PER_PAGE + i + 1} onClick={handleMockClick}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', alignItems: 'center' }}>
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </ListItem>
            ))}
          </div>
        </section>
      </div>

      {/* ── Hot Stocks ── */}
      <HotStocksSection cachedData={cachedData} onSelectItem={onSelectItem} />

      {/* Toast */}
      {showMockAlert && (
        <div className="animate-fade-up" style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: 'var(--bg-secondary)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)', padding: '14px 24px',
          borderRadius: '100px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertCircle style={{ color: '#fbbf24', flexShrink: 0 }} size={18} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>아직은 모의 데이터만 넣어놨습니다. (해커톤 시연용 화면입니다)</span>
        </div>
      )}
    </div>
  );
}

function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', [side]: '-18px', top: '50%', transform: 'translateY(-50%)',
    zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)',
    transition: 'background 0.2s',
  };
}

// ── Mock hot stocks fallback (shown when cache is empty) ──────────
const MOCK_HOT_STOCKS = [
  { id: 'm1', name: '엔비디아',         ticker: 'NVDA',  price: '$875.39',  change: +4.82, volume: '68.3M',  cap: '$2.16T', sector: '반도체' },
  { id: 'm2', name: '삼성전자',         ticker: '005930',price: '₩79,400', change: +2.14, volume: '21.2M',  cap: '474조',  sector: '반도체' },
  { id: 'm3', name: '테슬라',           ticker: 'TSLA',  price: '$248.50',  change: -1.93, volume: '112.7M', cap: '$791B',  sector: '전기차' },
  { id: 'm4', name: '애플',             ticker: 'AAPL',  price: '$189.84',  change: +1.06, volume: '55.4M',  cap: '$2.93T', sector: '빅테크' },
  { id: 'm5', name: 'SK하이닉스',       ticker: '000660',price: '₩187,500',change: +3.57, volume: '5.8M',   cap: '136조',  sector: '반도체' },
  { id: 'm6', name: '마이크로소프트',   ticker: 'MSFT',  price: '$420.21',  change: +0.74, volume: '23.1M',  cap: '$3.12T', sector: '빅테크' },
  { id: 'm7', name: '카카오',           ticker: '035720',price: '₩43,550', change: -2.34, volume: '8.9M',   cap: '19.4조', sector: '플랫폼' },
  { id: 'm8', name: '알파벳(구글)',     ticker: 'GOOGL', price: '$175.12',  change: +1.48, volume: '31.8M',  cap: '$2.17T', sector: '빅테크' },
  { id: 'm9', name: '현대차',           ticker: '005380',price: '₩224,000',change: +5.40, volume: '3.2M',   cap: '47.8조', sector: '자동차' },
  { id: 'm10',name: '아마존',           ticker: 'AMZN',  price: '$185.07',  change: +2.89, volume: '44.6M',  cap: '$1.93T', sector: '빅테크' },
];

type SortKey = 'rank' | 'change' | 'volume';

function HotStocksSection({ cachedData, onSelectItem }: { cachedData: ProcessedData[]; onSelectItem: (item: ProcessedData) => void }) {
  const [sortBy, setSortBy] = useState<SortKey>('change');
  const [tab, setTab]       = useState<'rise' | 'fall' | 'volume'>('rise');

  // Pull real stocks from cache
  const realStocks = cachedData
    .filter(d => d.category === 'stock')
    .map(d => {
      const data = d.data as any;
      return {
        id: d.id,
        name: d.title,
        ticker: data.ticker || data.symbol || '-',
        price: `₩${(data.currentPrice ?? 0).toLocaleString()}`,
        change: data.changePercent ?? 0,
        volume: data.volume ? `${(data.volume / 1_000_000).toFixed(1)}M` : '-',
        cap: '-',
        sector: d.categoryKo,
        _item: d,
      };
    });

  const source = realStocks.length >= 5 ? realStocks : MOCK_HOT_STOCKS.map(s => ({ ...s, _item: null as any }));

  const sorted = [...source].sort((a, b) => {
    if (tab === 'rise')   return b.change - a.change;
    if (tab === 'fall')   return a.change - b.change;
    return 0; // volume: keep order (mock only)
  }).slice(0, 10);

  const TABS: { key: typeof tab; label: string; icon: React.ReactNode }[] = [
    { key: 'rise',   label: '상승', icon: <ArrowUpRight size={13} /> },
    { key: 'fall',   label: '하락', icon: <ArrowDownRight size={13} /> },
    { key: 'volume', label: '거래량', icon: <Volume2 size={13} /> },
  ];

  return (
    <section style={{
      background: 'var(--bg-card)',
      
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '28px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame size={18} style={{ color: '#f97316' }} />
          <h3 style={{ fontWeight: 800, fontSize: '17px' }}>오늘의 핫 종목</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '4px' }}>
            {realStocks.length >= 5 ? '실시간 캐시 데이터' : '모의 데이터'}
          </span>
        </div>
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              border: tab === t.key ? '1px solid rgba(0,208,124,0.5)' : '1px solid var(--border)',
              background: tab === t.key ? 'rgba(0,208,124,0.12)' : 'transparent',
              color: tab === t.key ? '#008F55' : 'var(--text-muted)',              cursor: 'pointer', transition: 'all 0.18s',
            }}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 90px 90px 80px 80px',
        gap: '8px',
        padding: '0 12px 10px',
        borderBottom: '1px solid var(--border)',
        fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em',
      }}>
        <span>#</span>
        <span>종목</span>
        <span style={{ textAlign: 'right' }}>현재가</span>
        <span style={{ textAlign: 'right' }}>등락률</span>
        <span style={{ textAlign: 'right' }}>거래량</span>
        <span style={{ textAlign: 'right' }}>시가총액</span>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
        {sorted.map((stock, i) => {
          const isPos = stock.change >= 0;
          const col   = isPos ? 'var(--success)' : 'var(--danger)';
          return (
            <button
              key={stock.id}
              onClick={() => stock._item ? onSelectItem(stock._item) : undefined}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 90px 90px 80px 80px',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                cursor: stock._item ? 'pointer' : 'default',
                textAlign: 'left',
                alignItems: 'center',
                transition: 'background 0.18s',
                width: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Rank */}
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</span>

              {/* Name + ticker */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stock.name}
                </p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{stock.ticker}</span>
                  <span style={{ fontSize: '10px', color: 'var(--border-light)', background: 'var(--bg-secondary)', borderRadius: '4px', padding: '0 4px' }}>{stock.sector}</span>
                </div>
              </div>

              {/* Price */}
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right', fontFamily: 'monospace' }}>
                {stock.price}
              </span>

              {/* Change */}
              <span style={{ fontSize: '13px', fontWeight: 800, color: col, textAlign: 'right' }}>
                {isPos ? '+' : ''}{stock.change.toFixed(2)}%
              </span>

              {/* Volume */}
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>{stock.volume}</span>

              {/* Market Cap */}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{stock.cap}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
