import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { CategoryKey } from '@/lib/types';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'src', 'data', 'dummy', 'all_dummy_data.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const allData = JSON.parse(fileContents);

    const allProcessedItems: any[] = [];

    for (const cat of Object.keys(allData) as CategoryKey[]) {
      const categoryItems = allData[cat];
      if (!categoryItems || !Array.isArray(categoryItems)) continue;

      const processedItems = categoryItems.map((item: any, i: number) => ({
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
      }));

      allProcessedItems.push(...processedItems);
    }

    return NextResponse.json({ items: allProcessedItems });
  } catch (error) {
    console.error('Error serving all dummy data:', error);
    return NextResponse.json(
      { error: 'Failed to serve all dummy data' },
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
