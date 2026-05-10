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

      const processedItems = categoryItems.map((item: any) => ({
        id: item.id,
        category: cat,
        categoryKo: getCategoryKo(cat),
        title: item.name || item.ticker || item.pair || item.symbol || item.fundName || item.account || item.company || item.contractName || item.indicator || item.reitName || item.tradeId || '상세 데이터',
        summary: `${getCategoryKo(cat)} 데이터입니다.`,
        insights: [
          '최근 가격 변동성이 확대되고 있습니다.',
          '거래량이 평균 대비 증가하는 추세입니다.',
          '단기적 지지선/저항선 부근에서 등락을 거듭하고 있습니다.'
        ],
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
