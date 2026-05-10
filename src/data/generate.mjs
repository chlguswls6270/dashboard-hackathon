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
  const baseGdp = 2.0 + Math.random();
  const baseCpi = 3.0 + Math.random();
  const baseUnemp = 3.5 + Math.random();
  const baseInt = 5.0 + Math.random();
  categoryData.macro.push({
    id: `macro_${i}`, name: `거시경제 지표 ${i}`, country: '글로벌',
    gdp: baseGdp, cpi: baseCpi, unemploymentRate: baseUnemp, interestRate: baseInt,
    history: D.map((date, j) => ({
      date,
      gdpGrowth: baseGdp + Math.sin(j/30)*0.5,
      cpi: baseCpi + Math.cos(j/20)*0.5,
      unemploymentRate: baseUnemp + Math.sin(j/40)*0.2,
      interestRate: baseInt + Math.cos(j/50)*0.1
    }))
  });
}

// 11. Trade (10 items)
for(let i=1; i<=10; i++) {
  const trades = [];
  for(let j=0; j<30; j++) {
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    trades.push({
      date: D[Math.floor(Math.random() * D.length)],
      side,
      amount: Math.floor(Math.random() * 5000000) + 100000,
      name: `종목 ${Math.floor(Math.random() * 10) + 1}`
    });
  }
  // Sort trades by date
  trades.sort((a, b) => a.date.localeCompare(b.date));
  categoryData.trade.push({
    id: `trade_${i}`, name: `종합계좌 거래내역 ${i}`, account: `ACC-${i}`,
    trades,
    summary: { realizedPnL: 1500000 * i }
  });
}

// 12. Dividend (20 items)
for(let i=1; i<=20; i++) {
  const yieldVal = 3 + Math.random()*5;
  const dps = Math.floor(Math.random()*5000) + 500;
  categoryData.dividend.push({
    id: `div_${i}`, name: `고배당 주식 ${i}`, ticker: `DIV${i}`, 
    yield: yieldVal, currentYield: yieldVal.toFixed(2), dividendPerShare: dps,
    dividendHistory: Array.from({length: 12}).map((_, j) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - j) * 3); // Quarterly
      return {
        exDate: d.toISOString().split('T')[0],
        amount: dps * (1 + (Math.random() * 0.1 - 0.05))
      };
    })
  });
}

// 13. Derivatives (10 items)
for(let i=1; i<=10; i++) {
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 30 + i*5);
  
  const optionChain = [];
  const baseStrike = 350 + i;
  for(let j=-5; j<=5; j++) {
    const strike = baseStrike + j*5;
    optionChain.push({
      strike,
      callIV: 15 + Math.abs(j)*2 + Math.random(),
      putIV: 15 + Math.abs(j)*2.2 + Math.random(),
      callOI: Math.floor(Math.random() * 10000),
      putOI: Math.floor(Math.random() * 10000)
    });
  }

  categoryData.derivatives.push({
    id: `deriv_${i}`, name: `파생상품 KOSPI200 옵션 ${i}`, underlyingPrice: baseStrike,
    impliedVol: 18.5 + Math.random()*5,
    expiry: expDate.toISOString().split('T')[0],
    strike: baseStrike,
    optionChain
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
