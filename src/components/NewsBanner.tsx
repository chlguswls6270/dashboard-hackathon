'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const HEADLINE_NEWS = [
  {
    id: 1,
    category: '긴급',
    categoryColor: '#ef4444',
    title: 'AI 반도체 패권 전쟁 2라운드... 엔비디아 H200 품귀, 삼성·SK하이닉스 반사 수혜 주목',
    summary: '생성형 AI 학습용 H200 GPU 수요가 공급을 3배 이상 초과하며 품귀 현상이 심화되고 있다. 이에 따라 HBM 메모리 시장을 선도하는 국내 반도체 기업들이 최대 수혜주로 급부상하고 있다.',
    source: '글로벌경제',
    time: '5분 전',
    tag: '#반도체 #AI #엔비디아',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.20) 60%, rgba(20,27,45,0) 100%)',
    accent: '#818cf8',
  },
  {
    id: 2,
    category: '속보',
    categoryColor: '#f59e0b',
    title: '미 연준 FOMC 의사록 공개... "연내 2회 금리 인하" 가능성 열어둬',
    summary: '연방공개시장위원회(FOMC) 최신 의사록에서 위원 다수가 물가 둔화 흐름을 인정하며 연내 2회 금리 인하 시나리오에 동의한 것으로 확인됐다. 채권 시장은 즉각 강세로 반응했다.',
    source: '파이낸스뉴스',
    time: '32분 전',
    tag: '#FOMC #금리인하 #채권',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.30) 0%, rgba(234,179,8,0.15) 60%, rgba(20,27,45,0) 100%)',
    accent: '#fbbf24',
  },
  {
    id: 3,
    category: '분석',
    categoryColor: '#10b981',
    title: '비트코인, 1억 2천만 원 돌파 후 숨 고르기... 기관 ETF 순매수 사상 최대',
    summary: '비트코인 현물 ETF로의 기관 자금 유입이 사상 최대 규모를 기록한 가운데, 단기 차익 실현 물량이 맞물리며 횡보 구간이 연출되고 있다. 온체인 데이터는 장기 보유자의 매집 지속을 시사한다.',
    source: '크립토투데이',
    time: '1시간 전',
    tag: '#비트코인 #ETF #기관',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.30) 0%, rgba(5,150,105,0.15) 60%, rgba(20,27,45,0) 100%)',
    accent: '#34d399',
  },
  {
    id: 4,
    category: '특집',
    categoryColor: '#60a5fa',
    title: '2025 하반기 글로벌 경제 전망: 연착륙이냐 스태그플레이션이냐',
    summary: '월가 주요 IB들이 하반기 시나리오를 놓고 엇갈린 전망을 내놓고 있다. 골드만삭스는 연착륙 시나리오를 유지한 반면, JP모건은 스태그플레이션 리스크를 경고하며 방어적 포트폴리오를 권고했다.',
    source: '이코노믹리뷰',
    time: '2시간 전',
    tag: '#거시경제 #IB전망 #하반기',
    bg: 'linear-gradient(135deg, rgba(96,165,250,0.30) 0%, rgba(59,130,246,0.15) 60%, rgba(20,27,45,0) 100%)',
    accent: '#60a5fa',
  },
  {
    id: 5,
    category: '이슈',
    categoryColor: '#ec4899',
    title: '현대차·기아, 글로벌 전기차 판매량 3위 달성... 테슬라·BYD 맹추격',
    summary: '현대차그룹이 올해 1분기 전기차 판매량에서 글로벌 3위를 달성했다. 아이오닉 6·EV9 등 프리미엄 라인업이 유럽과 미국 시장에서 호평을 받으며 시장 점유율이 빠르게 확대되고 있다.',
    source: '모터트렌드코리아',
    time: '3시간 전',
    tag: '#현대차 #전기차 #EV',
    bg: 'linear-gradient(135deg, rgba(236,72,153,0.28) 0%, rgba(219,39,119,0.14) 60%, rgba(20,27,45,0) 100%)',
    accent: '#f472b6',
  },
];

const STOCK_NEWS = [
  {
    id: 1,
    category: '특징주',
    categoryColor: '#ef4444',
    title: '엔비디아 훈풍에 韓 반도체 투톱 "훨훨"... 삼성전자 8만 전자 탈환하나',
    summary: '글로벌 AI 반도체 대장주 엔비디아의 어닝 서프라이즈에 힘입어 국내 반도체 투톱인 삼성전자와 SK하이닉스에 외국인 매수세가 집중되고 있다.',
    source: '한국증권경제',
    time: '10분 전',
    tag: '#삼성전자 #SK하이닉스 #반도체',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(220,38,38,0.15) 60%, rgba(20,27,45,0) 100%)',
    accent: '#f87171',
  },
  {
    id: 2,
    category: '공시',
    categoryColor: '#3b82f6',
    title: '현대차, 주주환원 정책 확대 발표... "올해 자사주 1조원 매입·소각"',
    summary: '현대자동차가 주주가치 제고를 위해 역대 최대 규모인 1조원 규모의 자사주 매입 및 소각 계획을 발표했다. 발표 직후 주가는 4%대 급등세를 보이고 있다.',
    source: '마켓인사이트',
    time: '45분 전',
    tag: '#현대차 #주주환원 #자사주소각',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(37,99,235,0.15) 60%, rgba(20,27,45,0) 100%)',
    accent: '#60a5fa',
  },
  {
    id: 3,
    category: '시황',
    categoryColor: '#10b981',
    title: '코스피, 기관 순매수에 2700선 안착 시도... 밸류업 프로그램 수혜주 강세',
    summary: '정부의 기업 밸류업 프로그램 가이드라인 발표를 앞두고 저PBR 관련주로 분류되는 금융, 지주사들이 강세를 보이며 지수 상승을 견인하고 있다.',
    source: '여의도저널',
    time: '2시간 전',
    tag: '#코스피 #밸류업 #저PBR',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.15) 60%, rgba(20,27,45,0) 100%)',
    accent: '#34d399',
  }
];

const ETF_NEWS = [
  {
    id: 1,
    category: '신규상장',
    categoryColor: '#8b5cf6',
    title: '글로벌 AI 인프라 집중 투자 ETF 3종 동시 상장... 첫날부터 뭉칫돈',
    summary: '데이터센터, 전력망, 냉각 시스템 등 AI 인프라 밸류체인 전반에 투자하는 새로운 ETF들이 상장 첫날부터 개인 투자자들의 집중 매수세를 받고 있다.',
    source: 'ETF트렌드',
    time: '30분 전',
    tag: '#ETF #AI인프라 #신규상장',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(124,58,237,0.15) 60%, rgba(20,27,45,0) 100%)',
    accent: '#a78bfa',
  }
];

const INTERVAL_MS = 10000;

export default function NewsBanner({ onMockClick, categoryKey }: { onMockClick: (e: React.MouseEvent) => void, categoryKey?: string }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((next: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setIsAnimating(false);
      setProgress(0);
    }, 280);
  }, [isAnimating]);

  const newsData = categoryKey === 'stock' ? STOCK_NEWS : categoryKey === 'etf' ? ETF_NEWS : HEADLINE_NEWS;
  
  const prev = () => goTo((current - 1 + newsData.length) % newsData.length);
  const next = useCallback(() => goTo((current + 1) % newsData.length), [current, goTo, newsData.length]);
  
  // Auto-advance
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / INTERVAL_MS) * 100, 100));
    }, 50);
    const auto = setTimeout(next, INTERVAL_MS);
    return () => { clearInterval(tick); clearTimeout(auto); };
  }, [current, next]);

  const news = newsData[current] || HEADLINE_NEWS[0];

  return (
    <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', minHeight: '240px' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(14, 20, 36, 0.97)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: news.bg,
        borderRadius: '20px',
        transition: 'background 0.5s ease',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '36px 36px 72px',
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}>
        {/* Top row: category + source + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
            color: news.categoryColor,
            background: `${news.categoryColor}22`,
            border: `1px solid ${news.categoryColor}55`,
            borderRadius: '6px', padding: '2px 8px',
          }}>
            {news.category}
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{news.source}</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>·</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{news.time}</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: news.accent, opacity: 0.7 }}>{news.tag}</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '20px', fontWeight: 800, lineHeight: 1.4,
          color: 'rgba(255,255,255,0.95)', marginBottom: '10px',
          maxWidth: '780px',
        }}>
          {news.title}
        </h2>

        {/* Summary */}
        <p style={{
          fontSize: '13px', lineHeight: 1.7,
          color: 'rgba(255,255,255,0.55)',
          maxWidth: '720px',
        }}>
          {news.summary}
        </p>

        {/* CTA */}
        <button
          onClick={onMockClick}
          style={{
            marginTop: '16px',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 600,
            color: news.accent,
            background: `${news.accent}18`,
            border: `1px solid ${news.accent}40`,
            borderRadius: '8px', padding: '6px 14px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${news.accent}30`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${news.accent}18`; }}
        >
          <ExternalLink size={12} />
          전문 보기
        </button>
      </div>

      {/* ── Bottom bar: progress + dots + nav ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 32px 18px',
      }}>
        {/* Progress bar */}
        <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: news.accent,
            borderRadius: '2px',
            transition: 'width 0.08s linear',
          }} />
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {newsData.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === current ? news.accent : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Arrow nav */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[{ fn: prev, icon: <ChevronLeft size={14} /> }, { fn: next, icon: <ChevronRight size={14} /> }].map(({ fn, icon }, i) => (
            <button
              key={i}
              onClick={fn}
              style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = news.accent; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
