import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { CategoryKey } from '@/lib/types';

const ETF_SECTORS = [
  { sector: 'IT', weight: 28.5 },
  { sector: '금융', weight: 15.2 },
  { sector: '산업재', weight: 12.1 },
  { sector: '소재', weight: 9.8 },
  { sector: '헬스케어', weight: 8.4 },
  { sector: '에너지', weight: 6.3 },
  { sector: '유틸리티', weight: 5.1 },
  { sector: '통신', weight: 7.2 },
  { sector: '소비재', weight: 7.4 },
];

const ETF_HOLDINGS_POOL = [
  { ticker: '005930', name: '삼성전자', weight: 25.3 },
  { ticker: '000660', name: 'SK하이닉스', weight: 5.2 },
  { ticker: '207940', name: '삼성바이오로직스', weight: 3.8 },
  { ticker: '005380', name: '현대차', weight: 3.1 },
  { ticker: '035420', name: 'NAVER', weight: 2.9 },
  { ticker: '051910', name: 'LG화학', weight: 2.5 },
  { ticker: '006400', name: '삼성SDI', weight: 2.1 },
  { ticker: '035720', name: '카카오', weight: 1.9 },
];

// ─── Portfolio community data ──────────────────────────────────────
const PF_OWNERS = [
  { name: '김민준', handle: 'minjun_invest' },
  { name: '이서연', handle: 'syeon_trade' },
  { name: '박지호', handle: 'jiho_quant' },
  { name: '최수아', handle: 'sua_finance' },
  { name: '정우진', handle: 'wj_bull' },
  { name: '한예린', handle: 'yerin_long' },
  { name: '윤도현', handle: 'dohyun_value' },
  { name: '임지수', handle: 'jisu_etf' },
  { name: '강민서', handle: 'minseo_div' },
  { name: '오태양', handle: 'taeyang_q' },
];
const PF_TAG_POOL = [
  ['장기투자','분산형','안정추구'],
  ['성장주','공격형','기술섹터'],
  ['배당중심','인컴형','안정'],
  ['퀀트','모멘텀','리밸런싱'],
  ['글로벌분산','선진국','이머징'],
  ['ESG','가치투자','저PBR'],
  ['채권혼합','균형형','저변동성'],
  ['암호화폐포함','하이리스크','알파추구'],
  ['ETF중심','패시브','저비용'],
  ['배당성장','DRIP','복리'],
];
const PF_ALLOCATIONS = [
  [{ category:'주식', weight:35 },{ category:'ETF', weight:15 },{ category:'채권', weight:20 },{ category:'원자재', weight:10 },{ category:'암호화폐', weight:8 },{ category:'외환', weight:12 }],
  [{ category:'주식', weight:60 },{ category:'ETF', weight:20 },{ category:'채권', weight:10 },{ category:'현금', weight:10 }],
  [{ category:'채권', weight:50 },{ category:'주식', weight:30 },{ category:'리츠', weight:15 },{ category:'현금', weight:5 }],
  [{ category:'주식', weight:45 },{ category:'암호화폐', weight:25 },{ category:'ETF', weight:20 },{ category:'현금', weight:10 }],
  [{ category:'ETF', weight:55 },{ category:'채권', weight:25 },{ category:'원자재', weight:15 },{ category:'현금', weight:5 }],
];
const PF_HOLDINGS_POOL = [
  [{ asset:'삼성전자', category:'stock', value:18500000, weight:18.5, returnRate:12.3 },{ asset:'KODEX 200', category:'etf', value:15000000, weight:15, returnRate:9.8 },{ asset:'국고채 3년', category:'bonds', value:20000000, weight:20, returnRate:3.2 },{ asset:'금', category:'commodities', value:10000000, weight:10, returnRate:15.6 },{ asset:'비트코인', category:'crypto', value:8000000, weight:8, returnRate:45.2 }],
  [{ asset:'애플', category:'stock', value:22000000, weight:22, returnRate:28.4 },{ asset:'테슬라', category:'stock', value:18000000, weight:18, returnRate:-12.3 },{ asset:'TIGER 미국S&P500', category:'etf', value:25000000, weight:25, returnRate:18.9 },{ asset:'국고채 10년', category:'bonds', value:15000000, weight:15, returnRate:4.1 },{ asset:'달러예금', category:'forex', value:12000000, weight:12, returnRate:5.2 }],
  [{ asset:'SK하이닉스', category:'stock', value:16000000, weight:16, returnRate:35.2 },{ asset:'NAVER', category:'stock', value:12000000, weight:12, returnRate:-8.7 },{ asset:'카카오', category:'stock', value:10000000, weight:10, returnRate:-22.1 },{ asset:'삼성SDI', category:'stock', value:14000000, weight:14, returnRate:5.8 },{ asset:'KODEX 반도체', category:'etf', value:18000000, weight:18, returnRate:42.3 }],
];


export async function GET(
  request: Request,
  { params }: { params: Promise<{ cat: string }> }
) {
  try {
    const { cat: paramCat } = await params;
    const cat = paramCat as CategoryKey;
    const filePath = join(process.cwd(), 'src', 'data', 'dummy', 'all_dummy_data.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const allData = JSON.parse(fileContents);

    console.log("cat:", cat, "allData keys:", Object.keys(allData));
    const categoryItems = allData[cat];

    if (!categoryItems || !Array.isArray(categoryItems)) {
      return NextResponse.json(
        { error: 'Category not found or empty' },
        { status: 404 }
      );
    }

    // Convert raw data into ProcessedData format
    const processedItems = categoryItems.map((item: any, i: number) => {
      const idx = i;
      // ETF: 풍부한 섹터/보유종목/보수율 데이터 병합
      if (cat === 'etf') {
        const offset = idx % 3;
        const sectors = ETF_SECTORS.map((s, i) => ({
          ...s,
          weight: Math.max(1, +(s.weight + (i % 2 === 0 ? offset : -offset) * 0.5).toFixed(1))
        }));
        const holdingsCount = 5 + (idx % 4);
        const holdings = ETF_HOLDINGS_POOL.slice(0, holdingsCount).map((h, i) => ({
          ...h,
          weight: Math.max(0.5, +(h.weight - idx * 0.1 + i * 0.05).toFixed(1))
        }));
        item = {
          ...item,
          expenseRatio: +(0.05 + (idx % 10) * 0.03).toFixed(2),
          sectorAllocation: sectors,
          topHoldings: holdings,
        };
      }

      // Portfolio: 커뮤니티 공유 포트폴리오 데이터 병합
      if (cat === 'portfolio') {
        const owner = PF_OWNERS[idx % PF_OWNERS.length];
        const tags = PF_TAG_POOL[idx % PF_TAG_POOL.length];
        const riskLevels: Array<'low'|'medium'|'high'> = ['low','medium','high'];
        const riskLevel = riskLevels[idx % 3];
        const alloc = PF_ALLOCATIONS[idx % PF_ALLOCATIONS.length];
        const holdings = PF_HOLDINGS_POOL[idx % PF_HOLDINGS_POOL.length];
        // 날짜: 최근 30일 내 랜덤
        const daysAgo = (idx * 3) % 30;
        const postedAt = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
        // 추가 지표
        const annualizedReturn = +(item.returnRate * 3.2 + (idx % 5)).toFixed(1);
        const sharpeRatio = +(0.8 + (idx % 10) * 0.1).toFixed(2);
        const maxDrawdown = -(+(5 + (idx % 15))).toFixed(1);
        const benchmark = item.performanceHistory?.map((p: any) => ({
          ...p,
          benchmark: p.value * (1 - 0.003 * (idx % 5))
        }));
        item = {
          ...item,
          ownerName: owner.name,
          ownerHandle: owner.handle,
          likes: 20 + (idx * 17) % 280,
          bookmarks: 5 + (idx * 11) % 120,
          shareCount: (idx * 7) % 50,
          riskLevel,
          tags,
          postedAt,
          annualizedReturn,
          sharpeRatio,
          maxDrawdown,
          assetAllocation: alloc,
          holdings,
          performanceHistory: benchmark ?? item.performanceHistory,
        };
      }

      // Financial Metrics: 풍부한 지표 병합
      if (cat === 'financial_metrics') {
        const seed = idx + 1;
        const pbr = +(0.8 + (seed * 0.37) % 3.5).toFixed(2);
        const roa = +(3 + (seed * 1.3) % 12).toFixed(1);
        const operatingMargin = +(8 + (seed * 2.1) % 22).toFixed(1);
        const debtRatio = +(30 + (seed * 7) % 120).toFixed(0);
        const eps = +(800 + (seed * 430) % 8000).toFixed(0);
        const revenueGrowth = +(((seed * 3.7) % 30) - 5).toFixed(1);
        const netMargin = +(operatingMargin * 0.72).toFixed(1);
        const dividendYield = +(0.5 + (seed * 0.4) % 4).toFixed(2);
        // 연도별 EPS 추이 (최근 5년)
        const currentYear = new Date().getFullYear();
        const epsHistory = Array.from({ length: 5 }, (_, i) => ({
          year: String(currentYear - 4 + i),
          eps: Math.round(+eps * (0.7 + i * 0.08 + (seed % 3) * 0.02)),
        }));
        // 분기별 매출/영업이익 (최근 8분기)
        const baseRevenue = 500000 + seed * 80000;
        const quarterlyRevenue = Array.from({ length: 8 }, (_, i) => {
          const q = i + 1;
          const year = currentYear - Math.floor((8 - q) / 4);
          const quarter = ((8 - q) % 4) + 1;
          return {
            period: `${year}Q${quarter}`,
            revenue: Math.round(baseRevenue * (0.85 + i * 0.025 + Math.sin(i) * 0.03)),
            operatingProfit: Math.round(baseRevenue * (operatingMargin / 100) * (0.85 + i * 0.02)),
          };
        });
        item = {
          ...item,
          metrics: {
            ...item.metrics,
            pbr,
            roa,
            operatingMargin,
            debtRatio: +debtRatio,
            eps: +eps,
            revenueGrowth,
            netMargin,
            dividendYield,
          },
          epsHistory,
          quarterlyRevenue,
        };
      }


      return {
        id: item.id,
        category: cat,
        categoryKo: getCategoryKo(cat),
        title: item.name || item.ticker || item.pair || item.symbol || item.fundName || item.account || item.company || item.contractName || item.indicator || item.reitName || item.tradeId || '상세 데이터',
        summary: `${getCategoryKo(cat)} 데이터입니다.`,
        insights: generateInsights(cat, Math.abs(hashCode(item.id || String(i))), item.name || item.ticker || '상세 데이터'),
        chartType: getChartType(cat),
        timeRange: '1Y',
        riskLevel: 'medium',
        metadata: {
          dataSource: 'Dummy Data Generator',
          processedAt: new Date().toISOString(),
          confidenceScore: 0.95
        },
        data: item
      };
    });

    return NextResponse.json({ items: processedItems });
  } catch (error) {
    console.error('Error serving dummy data:', error);
    return NextResponse.json(
      { error: 'Failed to serve dummy data' },
      { status: 500 }
    );
  }
}


function getCategoryKo(cat: CategoryKey) {
  const map: Record<CategoryKey, string> = {
    stock: '주식', etf: 'ETF', portfolio: '포트폴리오',
    financial_metrics: '재무 지표', market_indicators: '시장 지표',
    bonds: '채권', commodities: '원자재', forex: '외환',
    crypto: '암호화폐', macro: '경제 지표', trade: '거래 내역',
    dividend: '배당', derivatives: '파생상품', funds: '펀드', reits: '리츠',
    dynamic: '동적 데이터'
  };
  return map[cat] || cat;
}

function getChartType(cat: CategoryKey) {
  const map: Record<CategoryKey, string> = {
    stock: 'candlestick', etf: 'pie', portfolio: 'pie',
    financial_metrics: 'radar', market_indicators: 'line',
    bonds: 'line', commodities: 'line', forex: 'line',
    crypto: 'line', macro: 'line', trade: 'bar',
    dividend: 'bar', derivatives: 'scatter', funds: 'area', reits: 'bar',
    dynamic: 'line'
  };
  return map[cat] || 'line';
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h;
}

function generateInsights(cat: CategoryKey, i: number, title: string) {
  const stockInsights = [
    `${title}의 최근 분기 실적 발표 이후 기관 매수세가 유입되고 있습니다.`,
    `동종 업계 대비 PER이 낮아 가치 평가 매력이 부각되고 있습니다.`,
    `주요 지지선인 60일 이동평균선을 상향 돌파하며 단기 반등 추세가 기대됩니다.`,
    `최근 외국인 투자자의 연속 순매수가 관찰되어 긍정적인 수급을 보이고 있습니다.`,
    `신규 프로젝트 수주 소식에 따라 중장기적 수익성 개선이 전망됩니다.`
  ];
  
  const etfInsights = [
    `${title} 테마 섹터 전반에 자금이 유입되며 거래량이 15% 이상 급증했습니다.`,
    `동일 카테고리 내 타 상품 대비 보수율이 낮아 장기 투자에 유리합니다.`,
    `기초 자산의 변동성이 커지고 있어 단기 헤지 수단으로 활용 가치가 높습니다.`,
    `편입 비중이 높은 상위 3개 종목의 실적 호조가 긍정적 영향을 주고 있습니다.`,
    `글로벌 트렌드에 부합하는 섹터 구성으로 기관 포트폴리오 편입이 늘고 있습니다.`
  ];

  const generalInsights = [
    `최근 가격 변동성이 점진적으로 확대되고 있어 단기 리스크 관리가 필요합니다.`,
    `거래량이 지난 주 대비 평균 20% 이상 증가하는 의미 있는 추세입니다.`,
    `단기적 지지선과 저항선 부근에서 등락을 거듭하며 명확한 방향성을 탐색 중입니다.`,
    `주요 매크로 지표 발표 이후 글로벌 시장의 관심이 해당 자산군에 집중되고 있습니다.`,
    `글로벌 공급망 및 산업 정책 이슈가 최근 가격 변동의 주요 원인으로 분석됩니다.`
  ];

  let selectedInsight = '';
  if (cat === 'stock') selectedInsight = stockInsights[i % stockInsights.length];
  else if (cat === 'etf' || cat === 'funds' || cat === 'portfolio') selectedInsight = etfInsights[i % etfInsights.length];
  else selectedInsight = generalInsights[i % generalInsights.length];

  return [
    selectedInsight,
    '보조 지표(RSI, MACD) 상 과매수/과매도 구간에 진입하여 기술적 반등/조정이 예상됩니다.',
    '최근 1개월 간의 누적 데이터 분석 결과, 향후 2주 내 주요 전환점에 도달할 확률이 70% 이상입니다.'
  ];
}
