import { writeFileSync, mkdirSync } from 'fs';

const dir = '/Users/choihyeonjin/Desktop/hackathons/dashboard-hackathon/src/data/dummy';
mkdirSync(dir, { recursive: true });

function dates(n, endDate = new Date()) {
  return Array.from({length: n}, (_, i) => {
    const d = new Date(endDate);
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split('T')[0];
  });
}

function randWalk(start, n, vol = 0.015) {
  let v = start;
  return Array.from({length: n}, () => {
    v = v * (1 + (Math.random() - 0.48) * vol);
    return parseFloat(v.toFixed(2));
  });
}

const D = dates(365);

const categoryData = {
  stock: [], etf: [], portfolio: [], financial_metrics: [], market_indicators: [],
  bonds: [], commodities: [], forex: [], crypto: [], macro: [], trade: [],
  dividend: [], derivatives: [], funds: [], reits: []
};

// 1. Stock (50 items)
for(let i=1; i<=50; i++) {
  const isKR = i <= 20;
  const start = isKR ? 50000 + Math.random()*100000 : 50 + Math.random()*200;
  const prices = randWalk(start, 365, 0.02);
  categoryData.stock.push({
    id: `stock_${i}`, ticker: `TICK${i}`, name: isKR ? `글로벌테크기업 ${i}` : `US Tech ${i}`, exchange: isKR ? 'KRX' : 'NASDAQ',
    priceHistory: D.map((date, j) => ({
      date, close: prices[j], open: prices[j]*1.01, high: prices[j]*1.02, low: prices[j]*0.98, volume: 1000000
    })),
    currentPrice: prices[364], changePercent: parseFloat(((prices[364]/prices[363]-1)*100).toFixed(2))
  });
}

// 2. ETF (30 items)
for(let i=1; i<=30; i++) {
  const prices = randWalk(10000, 365, 0.015);
  categoryData.etf.push({
    id: `etf_${i}`, ticker: `ETF${i}`, name: `KODEX/TIGER 테마 ETF ${i}`, nav: prices[364],
    priceHistory: D.map((date, j) => ({ date, price: prices[j], volume: 100000 }))
  });
}

// 3. Portfolio (20 items)
for(let i=1; i<=20; i++) {
  const prices = randWalk(100000000, 365, 0.01);
  categoryData.portfolio.push({
    id: `pf_${i}`, name: `맞춤형 AI 포트폴리오 ${i}`, totalValue: prices[364],
    returnRate: parseFloat(((prices[364]/prices[0]-1)*100).toFixed(2)),
    performanceHistory: D.map((date, j) => ({ date, value: prices[j] }))
  });
}

// 4. Financial Metrics (30 items)
for(let i=1; i<=30; i++) {
  categoryData.financial_metrics.push({
    id: `fin_${i}`, ticker: `TICK${i}`, name: `기업재무정보 ${i}`,
    metrics: { peRatio: 15 + Math.random()*10, roe: 10 + Math.random()*10 }
  });
}

// 5. Market Indicators (15 items)
const indNames = ['KOSPI', 'KOSDAQ', 'S&P 500', 'NASDAQ', 'DOW JONES', 'VIX', 'US10Y', 'KR10Y', 'WTI', 'BRENT', 'GOLD', 'SILVER', 'COPPER', 'SOX', 'DXY'];
for(let i=0; i<15; i++) {
  const prices = randWalk(3000, 365, 0.01);
  categoryData.market_indicators.push({
    id: `idx_${i}`, name: indNames[i], indexName: indNames[i], currentValue: prices[364], changePercent: parseFloat(((prices[364]/prices[363]-1)*100).toFixed(2)),
    history: D.map((date, j) => ({ date, value: prices[j] }))
  });
}

// 6. Bonds (15 items)
for(let i=1; i<=15; i++) {
  const yields = randWalk(3.5, 365, 0.005);
  categoryData.bonds.push({
    id: `bond_${i}`, name: i<=5 ? `국고채 ${i}년` : `회사채 우량등급 ${i}`, currentYield: yields[364],
    yieldHistory: D.map((date, j) => ({ date, yield: yields[j] }))
  });
}

// 7. Commodities (15 items)
for(let i=1; i<=15; i++) {
  const prices = randWalk(100, 365, 0.02);
  categoryData.commodities.push({
    id: `comm_${i}`, name: `글로벌 원자재 ${i}`, currentPrice: prices[364], changePercent: parseFloat(((prices[364]/prices[363]-1)*100).toFixed(2)),
    priceHistory: D.map((date, j) => ({ date, price: prices[j] }))
  });
}

// 8. Forex (15 items)
for(let i=1; i<=15; i++) {
  const rates = randWalk(1300, 365, 0.005);
  categoryData.forex.push({
    id: `fx_${i}`, name: `통화쌍 FX-${i}`, pair: `FX${i}/KRW`, currentRate: rates[364], changePercent: parseFloat(((rates[364]/rates[363]-1)*100).toFixed(2)),
    history: D.map((date, j) => ({ date, rate: rates[j] }))
  });
}

// 9. Crypto (20 items)
for(let i=1; i<=20; i++) {
  const prices = randWalk(1000, 365, 0.04);
  categoryData.crypto.push({
    id: `crypto_${i}`, name: `디지털 자산 ${i}`, symbol: `COIN${i}`, currentPrice: prices[364], change24h: parseFloat(((prices[364]/prices[363]-1)*100).toFixed(2)),
    priceHistory: D.map((date, j) => ({ date, price: prices[j] }))
  });
}

// 10. Macro (15 items)
for(let i=1; i<=15; i++) {
  categoryData.macro.push({
    id: `macro_${i}`, name: `거시경제 지표 ${i}`, country: '글로벌', indicators: { gdpGrowth: 2.5, cpi: 3.0 }
  });
}

// 11. Trade (10 items)
for(let i=1; i<=10; i++) {
  categoryData.trade.push({
    id: `trade_${i}`, name: `종합계좌 거래내역 ${i}`, account: `ACC-${i}`, summary: { realizedPnL: 1500000 * i }
  });
}

// 12. Dividend (20 items)
for(let i=1; i<=20; i++) {
  categoryData.dividend.push({
    id: `div_${i}`, name: `고배당 주식 ${i}`, ticker: `DIV${i}`, currentYield: (3 + Math.random()*5).toFixed(2)
  });
}

// 13. Derivatives (10 items)
for(let i=1; i<=10; i++) {
  categoryData.derivatives.push({
    id: `deriv_${i}`, name: `파생상품 KOSPI200 옵션 ${i}`, underlyingPrice: 350 + i
  });
}

// 14. Funds (20 items)
for(let i=1; i<=20; i++) {
  const navs = randWalk(1000, 365, 0.01);
  categoryData.funds.push({
    id: `fund_${i}`, name: `미래에셋/한국투자 펀드 ${i}`, nav: navs[364], navHistory: D.map((date, j) => ({ date, nav: navs[j] }))
  });
}

// 15. REITs (15 items)
for(let i=1; i<=15; i++) {
  const prices = randWalk(5000, 365, 0.005);
  categoryData.reits.push({
    id: `reit_${i}`, name: `상업용/물류 리츠 ${i}`, currentPrice: prices[364], priceHistory: D.map((date, j) => ({ date, price: prices[j] }))
  });
}

writeFileSync(`${dir}/all_dummy_data.json`, JSON.stringify(categoryData, null, 2));
console.log('✅ Generated ~300 items across 15 categories.');
