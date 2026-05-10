# Skills.md — 투자 데이터 분석 및 시각화 규칙

## 1. 데이터 카테고리 분류 기준

입력 데이터를 분석하여 아래 15개 카테고리 중 가장 적합한 하나로 분류한다.

| category (영문 키) | 한국어 명칭 | 핵심 식별 필드 |
|--------------------|-------------|----------------|
| `stock` | 주식 | ticker, open, high, low, close, volume |
| `etf` | ETF | ticker, nav, holdings, expense_ratio |
| `portfolio` | 포트폴리오 | assets, weights, total_value, return_rate |
| `financial_metrics` | 재무 지표 | pe_ratio, pb_ratio, eps, roe, roa, debt_ratio |
| `market_indicators` | 시장 지표 | index_name (KOSPI/S&P500/NASDAQ), vix |
| `bonds` | 채권 | yield, maturity, coupon_rate, credit_rating |
| `commodities` | 원자재 | commodity_name (Gold/Oil/Copper/Silver) |
| `forex` | 외환 | base_currency, quote_currency, rate |
| `crypto` | 암호화폐 | symbol (BTC/ETH/etc), market_cap |
| `macro` | 경제 지표 | gdp, cpi, unemployment_rate, interest_rate |
| `trade` | 거래 데이터 | trade_date, buy_sell, quantity, price |
| `dividend` | 배당 데이터 | ex_dividend_date, dividend_per_share, yield |
| `derivatives` | 옵션/파생상품 | option_type, strike, expiry, implied_vol |
| `funds` | 펀드 | fund_name, nav, total_return, benchmark |
| `reits` | 리츠 | property_type, ffo, distribution_yield |

---

## 2. 출력 JSON 스키마 (AI 응답 포맷)

AI는 반드시 아래 최상위 구조의 JSON만 반환한다.

```json
{
  "category": "<category 영문 키>",
  "categoryKo": "<한국어 카테고리명>",
  "title": "<데이터 제목 (자동 생성)>",
  "chartType": "<primary 차트 타입>",
  "subChartType": "<secondary 차트 타입 (없으면 null)>",
  "summary": "<3줄 이내 데이터 요약>",
  "insights": ["<인사이트 1>", "<인사이트 2>", "<인사이트 3>"],
  "riskLevel": "low | medium | high",
  "timeRange": "<데이터 시간 범위, 예: 1M / 3M / 1Y / 5Y>",
  "data": { /* 카테고리별 스키마 (3번 참조) */ },
  "metadata": {
    "rowCount": 0,
    "currency": "KRW | USD | EUR | ...",
    "dataSource": "<출처 또는 dummy>",
    "processedAt": "<ISO 8601 timestamp>"
  }
}
```

---

## 3. 카테고리별 data 스키마

### stock
```json
{
  "ticker": "string",
  "name": "string",
  "exchange": "string",
  "priceHistory": [{ "date": "YYYY-MM-DD", "open": 0, "high": 0, "low": 0, "close": 0, "volume": 0 }],
  "currentPrice": 0,
  "change": 0,
  "changePercent": 0,
  "marketCap": 0,
  "week52High": 0,
  "week52Low": 0
}
```

### etf
```json
{
  "ticker": "string",
  "name": "string",
  "nav": 0,
  "expenseRatio": 0,
  "priceHistory": [{ "date": "YYYY-MM-DD", "price": 0, "volume": 0 }],
  "sectorAllocation": [{ "sector": "string", "weight": 0 }],
  "topHoldings": [{ "ticker": "string", "name": "string", "weight": 0 }]
}
```

### portfolio
```json
{
  "totalValue": 0,
  "returnRate": 0,
  "annualizedReturn": 0,
  "sharpeRatio": 0,
  "maxDrawdown": 0,
  "holdings": [{ "asset": "string", "category": "string", "value": 0, "weight": 0, "returnRate": 0 }],
  "performanceHistory": [{ "date": "YYYY-MM-DD", "value": 0, "benchmark": 0 }],
  "assetAllocation": [{ "category": "string", "weight": 0 }]
}
```

### financial_metrics
```json
{
  "ticker": "string",
  "name": "string",
  "metrics": {
    "peRatio": 0, "pbRatio": 0, "psRatio": 0, "evEbitda": 0,
    "eps": 0, "bps": 0, "dps": 0,
    "roe": 0, "roa": 0, "roic": 0,
    "debtRatio": 0, "currentRatio": 0, "quickRatio": 0,
    "operatingMargin": 0, "netMargin": 0, "grossMargin": 0,
    "revenueGrowth": 0, "earningsGrowth": 0
  },
  "historicalMetrics": [{ "year": 0, "eps": 0, "roe": 0, "revenue": 0, "netIncome": 0 }],
  "peerComparison": [{ "ticker": "string", "peRatio": 0, "roe": 0 }]
}
```

### market_indicators
**주의: 아래 모든 필드를 반드시 채워야 한다. 특히 `sectorPerformance`(최소 8개 섹터)와 `breadth` 필드는 절대 빠뜨리면 안 된다.**
```json
{
  "indexName": "KOSPI",
  "currentValue": 2543.12,
  "change": -5.83,
  "changePercent": -0.23,
  "vix": 18.45,
  "history": [{ "date": "YYYY-MM-DD", "value": 0, "volume": 0 }],
  "sectorPerformance": [
    { "sector": "IT", "changePercent": 1.2 },
    { "sector": "금융", "changePercent": -0.5 },
    { "sector": "헬스케어", "changePercent": 0.8 },
    { "sector": "소비재", "changePercent": -1.1 },
    { "sector": "에너지", "changePercent": 2.3 },
    { "sector": "산업재", "changePercent": -0.3 },
    { "sector": "통신", "changePercent": 0.4 },
    { "sector": "유틸리티", "changePercent": -0.7 }
  ],
  "breadth": { "advancing": 412, "declining": 287, "unchanged": 51 },
  "additionalIndicators": {
    "putCallRatio": 0.85,
    "fearGreedIndex": 55,
    "marginDebt": 0
  }
}
```

### bonds
```json
{
  "issuer": "string",
  "bondType": "government | corporate | municipal",
  "couponRate": 0,
  "maturityDate": "YYYY-MM-DD",
  "creditRating": "string",
  "currentYield": 0,
  "yieldToMaturity": 0,
  "duration": 0,
  "yieldHistory": [{ "date": "YYYY-MM-DD", "yield": 0 }],
  "yieldCurve": [{ "maturity": "string", "yield": 0 }]
}
```

### commodities
```json
{
  "name": "string",
  "symbol": "string",
  "unit": "string",
  "currentPrice": 0,
  "change": 0,
  "changePercent": 0,
  "priceHistory": [{ "date": "YYYY-MM-DD", "price": 0, "volume": 0 }],
  "seasonality": [{ "month": "string", "avgReturn": 0 }]
}
```

### forex
```json
{
  "pair": "string",
  "baseCurrency": "string",
  "quoteCurrency": "string",
  "currentRate": 0,
  "change": 0,
  "changePercent": 0,
  "history": [{ "date": "YYYY-MM-DD", "rate": 0 }],
  "volatility": 0,
  "bid": 0,
  "ask": 0
}
```

### crypto
```json
{
  "symbol": "string",
  "name": "string",
  "currentPrice": 0,
  "marketCap": 0,
  "volume24h": 0,
  "change24h": 0,
  "change7d": 0,
  "priceHistory": [{ "date": "YYYY-MM-DD", "price": 0, "volume": 0 }],
  "dominance": 0,
  "circulatingSupply": 0
}
```

### macro
```json
{
  "country": "string",
  "indicators": {
    "gdpGrowth": 0, "cpi": 0, "coreCpi": 0,
    "unemploymentRate": 0, "baseRate": 0,
    "tradeBalance": 0, "currentAccount": 0,
    "m2Growth": 0
  },
  "history": [{ "date": "YYYY-MM-DD", "gdpGrowth": 0, "cpi": 0, "unemploymentRate": 0, "baseRate": 0 }]
}
```

### trade
```json
{
  "account": "string",
  "trades": [{ "date": "YYYY-MM-DD", "ticker": "string", "side": "buy|sell", "quantity": 0, "price": 0, "amount": 0, "fee": 0 }],
  "summary": { "totalTrades": 0, "totalBuy": 0, "totalSell": 0, "totalFees": 0, "realizedPnL": 0 }
}
```

### dividend
```json
{
  "ticker": "string",
  "name": "string",
  "currentYield": 0,
  "annualDividend": 0,
  "payoutRatio": 0,
  "dividendHistory": [{ "exDate": "YYYY-MM-DD", "payDate": "YYYY-MM-DD", "amount": 0, "frequency": "quarterly|annual|monthly" }],
  "dividendGrowthRate": 0,
  "consecutiveYears": 0
}
```

### derivatives
```json
{
  "underlying": "string",
  "underlyingPrice": 0,
  "expiryDate": "YYYY-MM-DD",
  "optionChain": [{ "strike": 0, "callBid": 0, "callAsk": 0, "callIV": 0, "callOI": 0, "putBid": 0, "putAsk": 0, "putIV": 0, "putOI": 0 }],
  "greeks": { "delta": 0, "gamma": 0, "theta": 0, "vega": 0 },
  "ivSurface": [{ "expiry": "string", "strike": 0, "iv": 0 }]
}
```

### funds
```json
{
  "fundName": "string",
  "fundCode": "string",
  "category": "string",
  "nav": 0,
  "totalReturn1Y": 0,
  "totalReturn3Y": 0,
  "totalReturn5Y": 0,
  "benchmark": "string",
  "benchmarkReturn1Y": 0,
  "expenseRatio": 0,
  "aum": 0,
  "navHistory": [{ "date": "YYYY-MM-DD", "nav": 0 }],
  "topHoldings": [{ "name": "string", "weight": 0 }]
}
```

### reits
```json
{
  "ticker": "string",
  "name": "string",
  "propertyType": "office | retail | residential | industrial | mixed",
  "currentPrice": 0,
  "ffo": 0,
  "affo": 0,
  "distributionYield": 0,
  "navPerShare": 0,
  "occupancyRate": 0,
  "priceHistory": [{ "date": "YYYY-MM-DD", "price": 0, "dividend": 0 }],
  "propertyBreakdown": [{ "type": "string", "weight": 0 }]
}
```

### dynamic (AI 종합 분석 - 권장)
다양한 데이터가 섞여 있거나, 특정 카테고리로 한정하기 어려울 때 사용한다. 시각화 조각(blocks)들을 유동적으로 구성한다.
```json
{
  "blocks": [
    {
      "id": "string",
      "type": "metrics | chart | radar | insights | table | ranking",
      "title": "string",
      "description": "string",
      "layout": "full | half | third",
      "data": {}, 
      "config": { "chartType": "line|bar|pie|...", "xAxisKey": "string", "yAxisKey": "string" }
    }
  ]
}
```
*   `metrics`: 핵심 수치 요약 (label, value, unit, change, desc). **주의: desc 필드에 해당 지표에 대한 설명이나 툴팁 정보를 반드시 포함할 것!**
*   `chart`: 일반적인 차트 데이터 (Recharts 호환)
*   `radar`: 다차원 비교 스코어
*   `table`: 상세 내역 표 데이터
*   `ranking`: 순위 데이터 (name, value, score)

---

## 4. 차트 타입 선택 기준

| 데이터 특성 | chartType |
|-------------|-----------|
| 시계열 가격 데이터 (OHLCV) | `candlestick` |
| 단순 시계열 추이 | `line` |
| 카테고리 비교 | `bar` |
| 비율/구성 | `pie` 또는 `donut` |
| 상관관계/분포 | `scatter` |
| 포트폴리오 성과 비교 | `area` |
| 멀티 지표 비교 | `radar` |
| 옵션 체인 | `heatmap` |
| 수익률 분포 | `histogram` |

---

## 5. 인사이트 생성 규칙 (AI Insights)

단순한 수치 나열이나 현상 요약을 넘어, **사용자의 투자 결정에 실질적인 도움**을 줄 수 있는 심층적이고 행동 지향적인 인사이트를 도출해야 합니다.

1. **원인과 의미 (Why & What it means)**: "수익률이 10% 올랐다"로 끝내지 말고, 데이터에 나타난 변화의 '주요 동인(Driver)'과 그것이 투자자에게 미치는 '실질적 의미'를 해석합니다.
2. **리스크 경고 및 숨은 취약점 (Risk & Vulnerability)**: 겉보기에 좋은 성과 뒤에 숨겨진 자산 쏠림 현상(특정 섹터 과비중), 높은 변동성, 금리 등 거시경제 민감도 같은 잠재적 위험 요소를 예리하게 짚어줍니다.
3. **상황적 맥락 (Contextual Analysis)**: 단순 비교를 넘어, "어떤 시장 상황(예: 하락장, 인플레이션)에서 이 데이터가 강점/약점을 가지는지" 입체적으로 분석합니다.
4. **행동 지향적 제언 (Actionable Next Step)**: 현재 데이터를 바탕으로 사용자가 고려해볼 만한 전략적 선택지(포트폴리오 리밸런싱, 헷징, 비중 조절 등)를 제안합니다. (예: "기술주 비중이 60%를 초과하여 변동성 위험이 큽니다. 방어주 편입을 통한 헷징을 고려해 볼 수 있습니다.")
5. **구체성 (Specifics)**: 모호하고 뻔한 조언을 피하고, 반드시 데이터 속의 '정확한 수치'를 근거로 삼아 설득력 있게 작성합니다. (인사이트는 3~5개 생성)

---

## 6. 리스크 레벨 분류 기준

| riskLevel | 기준 |
|-----------|------|
| `low` | 국채, 예금, 안정적 배당주, VIX < 20 |
| `medium` | 우량 회사채, 대형주, ETF, VIX 20-30 |
| `high` | 소형주, 암호화폐, 고수익 채권, 파생상품, VIX > 30 |
