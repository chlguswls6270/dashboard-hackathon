'use client';

import { useState, useMemo, useRef } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { ProcessedData } from '@/lib/types';
import StockChart from './StockChart';
import ETFPriceChart from './ETFPriceChart';
import Sparkline from '../Sparkline';

// ─── Portfolio 전용 상세 컴포넌트 ────────────────────────────────────
const PF_PERIODS = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 9999 },
];

const ALLOC_COLORS: Record<string,string> = {
  '주식':'#6366f1','ETF':'#8b5cf6','채권':'#06b6d4','원자재':'#f59e0b',
  '암호화폐':'#ef4444','외환':'#f97316','리츠':'#22c55e','현금':'#94a3b8',
};

const CAT_COLORS: Record<string,string> = {
  stock:'#6366f1', etf:'#8b5cf6', bonds:'#06b6d4',
  commodities:'#f59e0b', crypto:'#ef4444', forex:'#f97316',
  reits:'#22c55e',
};

const pfTooltipStyle = {
  backgroundColor:'#0f1629', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:12, color:'#e2e8f0', fontSize:12, padding:'10px 14px',
};

function fmtPfDate(d: string) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getMonth()+1}/${dt.getDate()}`;
}

function fmtPfMoney(v: number) {
  if (!v || isNaN(v)) return '-';
  if (v >= 1e8) return `₩${(v/1e8).toFixed(1)}억`;
  if (v >= 1e4) return `₩${(v/1e4).toFixed(0)}만`;
  return `₩${v.toLocaleString()}`;
}

type PerfPoint = { date: string; value: number; benchmark?: number };
type Holding = { asset: string; category: string; value: number; weight: number; returnRate: number };
type AllocItem = { category: string; weight: number };

function PortfolioDetailChart({
  perfHistory, holdings, alloc, tooltipStyleProp
}: {
  perfHistory: PerfPoint[];
  holdings: Holding[];
  alloc: AllocItem[];
  tooltipStyleProp: object;
}) {
  const [period, setPeriod] = useState('3M');

  const filtered = useMemo(() => {
    const days = PF_PERIODS.find(p => p.label === period)?.days ?? 90;
    return perfHistory.slice(-days);
  }, [perfHistory, period]);

  // Y축 범위를 데이터 min/max에 딱 맞춰 등락이 극적으로 보이게
  const vals = filtered.map(p => p.value).filter(Boolean);
  const bmarks = filtered.map(p => p.benchmark ?? 0).filter(Boolean);
  const allVals = [...vals, ...bmarks];
  const yMin = allVals.length ? Math.min(...allVals) * 0.997 : 0;
  const yMax = allVals.length ? Math.max(...allVals) * 1.003 : 1;

  const firstVal = filtered[0]?.value ?? 0;
  const lastVal = filtered[filtered.length - 1]?.value ?? 0;
  const change = firstVal ? ((lastVal - firstVal) / firstVal) * 100 : 0;
  const isUp = change >= 0;
  const lineColor = isUp ? '#ef4444' : '#3b82f6';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* ── 성과 차트 ── */}
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>성과 추이 vs 벤치마크</span>
            <span style={{ fontSize:13, fontWeight:700, color: lineColor }}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>({period} 기준)</span>
          </div>
          {/* 기간 선택 */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:3, gap:2 }}>
            {PF_PERIODS.map(({ label }) => (
              <button key={label} onClick={() => setPeriod(label)} style={{
                padding:'5px 12px', fontSize:12, fontWeight:600, borderRadius:8, border:'none', cursor:'pointer',
                background: period === label ? 'rgba(99,102,241,0.3)' : 'transparent',
                color: period === label ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                transition:'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={filtered} margin={{ top:4, right:8, bottom:0, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date" tickFormatter={fmtPfDate}
              tick={{ fill:'#475569', fontSize:10 }} tickLine={false} axisLine={false}
              interval={Math.max(1, Math.floor(filtered.length/10))}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={fmtPfMoney}
              tick={{ fill:'#475569', fontSize:10 }} tickLine={false} axisLine={false}
              orientation="right" width={80}
            />
            <Tooltip
              contentStyle={pfTooltipStyle}
              formatter={(v:number, n:string) => [fmtPfMoney(v), n]}
              labelFormatter={fmtPfDate}
            />
            <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
            <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2.5} dot={false} name="포트폴리오" />
            <Line type="monotone" dataKey="benchmark" stroke="#10b981" strokeWidth={1.5} dot={false} name="벤치마크" strokeDasharray="5 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── 자산 배분 도넛 + 종목별 수익률 바 ── */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>자산 배분</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={alloc} dataKey="weight" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                label={({category,weight}) => `${category} ${weight}%`} labelLine={false}>
                {alloc.map((a,i) => <Cell key={i} fill={ALLOC_COLORS[a.category] ?? `hsl(${i*40},70%,55%)`} />)}
              </Pie>
              <Tooltip contentStyle={pfTooltipStyle} formatter={(v:number) => [`${v}%`, '비중']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>보유 종목별 수익률</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={holdings} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false} />
              <XAxis type="number" tick={{ fill:'#475569', fontSize:10 }} tickFormatter={v=>`${v}%`} />
              <YAxis dataKey="asset" type="category" tick={{ fill:'#94a3b8', fontSize:10 }} width={90} />
              <Tooltip contentStyle={pfTooltipStyle} formatter={(v:number) => [`${v > 0 ? '+' : ''}${v}%`, '수익률']} cursor={false} />
              <Bar dataKey="returnRate" isAnimationActive={false} activeBar={false}
                shape={(props:any) => (
                  <rect x={props.x} y={props.y} width={Math.abs(props.width)} height={props.height}
                    fill={props.value >= 0 ? '#ef4444' : '#3b82f6'} rx={4}
                    transform={props.value < 0 ? `translate(${props.width},0)` : undefined}
                  />
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 보유 종목 세부 카드 ── */}
      {holdings.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>보유 종목 세부</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
            {holdings.map((h, i) => {
              const isHUp = h.returnRate >= 0;
              const catColor = CAT_COLORS[h.category] ?? '#64748b';
              return (
                <div key={i} style={{
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:14, padding:'16px 18px',
                  borderLeft: `3px solid ${catColor}`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.9)' }}>{h.asset}</span>
                    <span style={{
                      fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6,
                      background: `${catColor}22`, color: catColor
                    }}>{h.category}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:2 }}>평가금액</p>
                      <p style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.85)' }}>{fmtPfMoney(h.value)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:2 }}>비중</p>
                      <p style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.85)' }}>{h.weight}%</p>
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:2 }}>수익률</p>
                      <p style={{ fontSize:15, fontWeight:800, color: isHUp ? '#ef4444' : '#3b82f6' }}>
                        {isHUp ? '+' : ''}{h.returnRate}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 재무 지표 카드 (ⓘ 호버 툴팁) ─────────────────────────────────
function MetricCard({ label, value, unit, hint, hintColor, desc, sparkData, onClick }: {
  label: string; value: string; unit: string;
  hint: string; hintColor: string; desc: string; sparkData?: number[];
  onClick?: () => void;
}) {
  const [showTip, setShowTip] = useState(false);
  const [tipPos, setTipPos] = useState<'top' | 'bottom'>('top');
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      // 위에 공간이 80px보다 적으면 아래로 띄움
      if (rect.top < 80) {
        setTipPos('bottom');
      } else {
        setTipPos('top');
      }
    }
    setShowTip(true);
  };

  return (
    <div onClick={onClick} style={{
      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:12, padding:'14px 16px', position:'relative',
      zIndex: showTip ? 50 : 1, transition: 'background 0.2s, z-index 0s',
      cursor: onClick ? 'pointer' : 'default'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    >
      {/* 라벨 행: 라벨 왼쪽 / ⓘ+뱃지 오른쪽 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {/* 뱃지 */}
          {hint !== '-' && (
            <span style={{ fontSize:10, color: hintColor, fontWeight:700, background:`${hintColor}1a`, padding:'2px 7px', borderRadius:5 }}>{hint}</span>
          )}
          {/* ⓘ 버튼 */}
          {desc && desc.trim() !== '' && (
            <div
              ref={iconRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowTip(false)}
              style={{ position:'relative', cursor:'default', display:'flex', alignItems:'center' }}
            >
              <span style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:16, height:16, borderRadius:'50%',
                border:'1px solid rgba(255,255,255,0.22)', fontSize:10,
                color:'rgba(255,255,255,0.4)', fontWeight:700,
                userSelect:'none',
              }}>i</span>
              {showTip && (
                <div style={{
                  position:'absolute', 
                  ...(tipPos === 'top' ? { bottom:'calc(100% + 8px)' } : { top:'calc(100% + 8px)' }),
                  right:-8, width: 220,
                  background:'rgba(10,14,26,0.97)', border:'1px solid rgba(255,255,255,0.12)',
                  borderRadius:8, padding:'10px 14px', whiteSpace:'normal', wordBreak:'keep-all',
                  fontSize:12, color:'rgba(255,255,255,0.85)', zIndex:999,
                  boxShadow:'0 10px 30px rgba(0,0,0,0.6)',
                  pointerEvents:'none', lineHeight:1.45
                }}>
                  {desc}
                  <div style={{
                    position:'absolute', 
                    ...(tipPos === 'top' ? { top:'100%' } : { bottom:'100%' }),
                    right:10, width:0, height:0,
                    borderLeft:'6px solid transparent', borderRight:'6px solid transparent',
                    [tipPos === 'top' ? 'borderTop' : 'borderBottom']:'6px solid rgba(255,255,255,0.12)',
                  }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* 값 & 미니 그래프 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <p style={{ fontSize:18, fontWeight:800, color:'rgba(255,255,255,0.9)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', paddingRight:8 }}>
          {value}<span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginLeft:2 }}>{unit}</span>
        </p>
        {sparkData && sparkData.length > 0 && value !== '-' && (
          <div style={{ width: 64, height: 28, opacity: 0.85, flexShrink: 0 }}>
            <Sparkline data={sparkData} color={hintColor !== '#94a3b8' && hintColor !== '-' ? hintColor : '#8b5cf6'} width="100%" height="100%" />
          </div>
        )}
      </div>
    </div>
  );
}

// 상위 보유 종목: 정적 바 + 툴팁만
function HoldingsBarChart({ holdings, tooltipStyle }: { holdings: {name:string;weight:number}[]; tooltipStyle: object }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={holdings} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false} />
        <XAxis type="number" tick={{ fill:'#475569', fontSize:11 }} />
        <YAxis dataKey="name" type="category" tick={{ fill:'#94a3b8', fontSize:11 }} width={100} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`${v}%`, '비중']} cursor={false} />
        <Bar
          dataKey="weight"
          fill="#8b5cf6"
          radius={[0,4,4,0]}
          isAnimationActive={false}
          activeBar={false}
          shape={(props: any) => (
            <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="#8b5cf6" rx={4} />
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#a855f7','#0ea5e9'];

const tooltipStyle = {
  backgroundColor: '#141b2d',
  border: '1px solid #1e2d4a',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 12,
};

function fmtDate(d: string) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getMonth()+1}/${dt.getDate()}`;
}

function fmtNum(v: number, prefix = '') {
  if (v === undefined || v === null) return '-';
  if (Math.abs(v) >= 1e9) return `${prefix}${(v/1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `${prefix}${(v/1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e4) return `${prefix}${(v/1e3).toFixed(0)}K`;
  return `${prefix}${v.toFixed(2)}`;
}

export default function ChartPanel({ data }: { data: ProcessedData }) {
  const d = data.data as Record<string, unknown>;
  const [openWindows, setOpenWindows] = useState<any[]>([]);
  const [maxZ, setMaxZ] = useState(100000);

  const openWindow = (metric: any) => {
    if (openWindows.find(w => w.label === metric.label)) {
      focusWindow(metric.label);
      return;
    }
    const newWin = {
      ...metric,
      id: metric.label,
      x: 300 + openWindows.length * 30,
      y: 100 + openWindows.length * 30,
      zIndex: maxZ + 1
    };
    setOpenWindows([...openWindows, newWin]);
    setMaxZ(maxZ + 1);
  };

  const closeWindow = (label: string) => {
    setOpenWindows(openWindows.filter(w => w.label !== label));
  };

  const focusWindow = (label: string) => {
    setOpenWindows(openWindows.map(w => 
      w.label === label ? { ...w, zIndex: maxZ + 1 } : w
    ));
    setMaxZ(maxZ + 1);
  };

  const updatePos = (label: string, x: number, y: number) => {
    setOpenWindows(prev => prev.map(w => 
      w.label === label ? { ...w, x, y } : w
    ));
  };

  // 데이터 처리 로직 메모이제이션 (드래그 시 불필요한 재계산 및 랜덤 데이터 생성 방지)
  const financialMetricsData = useMemo(() => {
    if (data.category !== 'financial_metrics') return null;
    
    const m = (d.metrics as Record<string,number> | undefined) ?? {};
    const epsHistory = (d.epsHistory as {year:string;eps:number}[] | undefined) ?? [];
    const quarterly = (d.quarterlyRevenue as {period:string;revenue:number;operatingProfit:number}[] | undefined) ?? [];

    // 레이더 데이터
    const radarData = [
      { metric:'수익성(ROE)', value: Math.min(100, ((m.roe ?? 0) / 30) * 100) },
      { metric:'효율성(ROA)', value: Math.min(100, ((m.roa ?? 0) / 15) * 100) },
      { metric:'성장성', value: Math.min(100, Math.max(0, ((m.revenueGrowth ?? 0) + 5) / 35 * 100)) },
      { metric:'안정성', value: Math.min(100, Math.max(0, 100 - (m.debtRatio ?? 50) * 0.7)) },
      { metric:'밸류에이션', value: m.peRatio ? Math.min(100, (40 / m.peRatio) * 100) : 0 },
      { metric:'마진', value: Math.min(100, ((m.operatingMargin ?? 0) / 25) * 100) },
    ];

    const genSpark = (base: number | undefined, trend: 'up'|'down'|'flat' = 'flat') => {
      if (base == null) return [];
      // 고정된 시드나 일관된 규칙 없이 Math.random()을 쓰면 리렌더링마다 데이터가 바뀜
      // 여기서는 useMemo 덕분에 data가 바뀔 때만 생성됨
      return Array.from({length: 12}, (_, i) => {
         let val = base * (1 + (Math.random() - 0.5) * 0.15);
         if (trend === 'up') val += (i/12) * base * 0.3;
         if (trend === 'down') val -= (i/12) * base * 0.3;
         return val;
      });
    };

    const metricCards = [
      { label:'PER', value: m.peRatio?.toFixed(1) ?? '-', unit:'배', desc:'주가가 회사의 1년 순이익의 몇 배인지 나타냅니다. 낮을수록 저평가되어 있습니다.', hint: m.peRatio ? (m.peRatio < 15 ? '저평가' : m.peRatio < 25 ? '적정' : '고평가') : '-', hintColor: m.peRatio ? (m.peRatio < 15 ? '#10b981' : m.peRatio < 25 ? '#f59e0b' : '#ef4444') : '#94a3b8', sparkData: genSpark(m.peRatio, m.peRatio && m.peRatio < 15 ? 'down' : 'flat') },
      { label:'PBR', value: m.pbr?.toFixed(2) ?? '-', unit:'배', desc:'회사의 순자산(가진 돈) 대비 주가가 몇 배인지 나타냅니다. 1 미만이면 회사를 다 팔아도 남는 장사라는 뜻입니다.', hint: m.pbr ? (m.pbr < 1 ? '저평가' : m.pbr < 2 ? '적정' : '고평가') : '-', hintColor: m.pbr ? (m.pbr < 1 ? '#10b981' : m.pbr < 2 ? '#f59e0b' : '#ef4444') : '#94a3b8', sparkData: genSpark(m.pbr, 'flat') },
      { label:'ROE', value: m.roe?.toFixed(1) ?? '-', unit:'%', desc:'주주의 돈(자본)을 굴려서 1년에 몇 %의 수익을 냈는지 보여줍니다. 높을수록 장사를 잘하는 곳입니다.', hint: m.roe ? (m.roe >= 15 ? '우수' : m.roe >= 8 ? '양호' : '주의') : '-', hintColor: m.roe ? (m.roe >= 15 ? '#10b981' : m.roe >= 8 ? '#f59e0b' : '#ef4444') : '#94a3b8', sparkData: genSpark(m.roe, m.roe && m.roe >= 15 ? 'up' : 'flat') },
      { label:'ROA', value: m.roa?.toFixed(1) ?? '-', unit:'%', desc:'회사가 가진 모든 자산(빚 포함)을 활용해 얼만큼의 수익을 냈는지 보여줍니다.', hint: m.roa ? (m.roa >= 8 ? '우수' : m.roa >= 4 ? '양호' : '주의') : '-', hintColor: m.roa ? (m.roa >= 8 ? '#10b981' : m.roa >= 4 ? '#f59e0b' : '#ef4444') : '#94a3b8', sparkData: genSpark(m.roa, 'flat') },
      { label:'영업이익률', value: m.operatingMargin?.toFixed(1) ?? '-', unit:'%', desc:'물건을 팔고 남은 순수한 장사 이윤이 몇 %인지 나타냅니다.', hint: m.operatingMargin ? (m.operatingMargin >= 15 ? '우수' : m.operatingMargin >= 8 ? '양호' : '주의') : '-', hintColor: m.operatingMargin ? (m.operatingMargin >= 15 ? '#10b981' : m.operatingMargin >= 8 ? '#f59e0b' : '#ef4444') : '#94a3b8', sparkData: genSpark(m.operatingMargin, 'up') },
      { label:'순이익률', value: m.netMargin?.toFixed(1) ?? '-', unit:'%', desc:'모든 비용과 세금까지 다 떼고 최종적으로 회사 주머니에 남은 수익 비율입니다.', hint: '-', hintColor: '#94a3b8', sparkData: genSpark(m.netMargin, 'up') },
      { label:'부채비율', value: m.debtRatio?.toFixed(0) ?? '-', unit:'%', desc:'내 돈(자본) 대비 남의 돈(빚)이 얼마나 되는지 나타냅니다. 낮을수록 안전합니다.', hint: m.debtRatio ? (m.debtRatio < 50 ? '안정' : m.debtRatio < 100 ? '양호' : '주의') : '-', hintColor: m.debtRatio ? (m.debtRatio < 50 ? '#10b981' : m.debtRatio < 100 ? '#f59e0b' : '#ef4444') : '#94a3b8', sparkData: genSpark(m.debtRatio, m.debtRatio && m.debtRatio > 100 ? 'up' : 'down') },
      { label:'매출성장률', value: m.revenueGrowth?.toFixed(1) ?? '-', unit:'%', desc:'작년보다 물건을 얼마나 더 많이 팔았는지 나타냅니다.', hint: m.revenueGrowth ? (m.revenueGrowth >= 10 ? '고성장' : m.revenueGrowth >= 0 ? '성장' : '역성장') : '-', hintColor: m.revenueGrowth ? (m.revenueGrowth >= 10 ? '#10b981' : m.revenueGrowth >= 0 ? '#f59e0b' : '#ef4444') : '#94a3b8', sparkData: genSpark(m.revenueGrowth, 'flat') },
      { label:'EPS', value: m.eps ? `₩${(+m.eps).toLocaleString()}` : '-', unit:'', desc:'주식 1주가 1년 동안 벌어들인 순이익입니다. 꾸준히 우상향하는 회사가 좋습니다.', hint: '-', hintColor: '#94a3b8', sparkData: epsHistory.map(h => h.eps) },
      { label:'배당수익률', value: m.dividendYield?.toFixed(2) ?? '-', unit:'%', desc:'지금 주식 1주를 사면 1년에 배당금으로 몇 %를 받을 수 있는지 나타냅니다.', hint: m.dividendYield ? (m.dividendYield >= 3 ? '고배당' : m.dividendYield >= 1 ? '배당주' : '저배당') : '-', hintColor: '#94a3b8', sparkData: genSpark(m.dividendYield, 'flat') },
    ];

    return { m, epsHistory, quarterly, radarData, metricCards };
  }, [data, d]);

  switch (data.category) {
    case 'stock': {
      const history = d.priceHistory as { date: string; open: number; high: number; low: number; close: number; volume: number }[];
      return <StockChart history={history ?? []} />;
    }

    case 'etf': {
      const sectors = (d.sectorAllocation as {sector:string;weight:number}[] | undefined) ?? [];
      const holdings = (d.topHoldings as {name:string;weight:number}[] | undefined) ?? [];
      const priceHistory = (d.priceHistory as {date:string;price:number;volume:number}[] | undefined) ?? [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* 섹터 비중 + 보유 종목 */}
          {(sectors.length > 0 || holdings.length > 0) && (
            <div className="grid grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>섹터 비중</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={sectors} dataKey="weight" nameKey="sector" cx="50%" cy="50%" outerRadius={100} label={({sector,weight})=>`${sector} ${weight}%`} labelLine={false}>
                      {sectors.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`${v}%`, '비중']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>상위 보유 종목</p>
                <HoldingsBarChart holdings={holdings} tooltipStyle={tooltipStyle} />
              </div>
            </div>
          )}
          {/* 가격 추이 차트 */}
          {priceHistory.length > 0 && (
            <ETFPriceChart priceHistory={priceHistory} />
          )}
          {sectors.length === 0 && holdings.length === 0 && priceHistory.length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>ETF 구성 데이터가 없습니다.</p>
          )}
        </div>
      );
    }

    case 'portfolio': {
      const perfHistory = (d.performanceHistory as PerfPoint[] | undefined) ?? [];
      const alloc = (d.assetAllocation as AllocItem[] | undefined) ?? [];
      const holdings = (d.holdings as Holding[] | undefined) ?? [];
      return <PortfolioDetailChart perfHistory={perfHistory} holdings={holdings} alloc={alloc} tooltipStyleProp={tooltipStyle} />;
    }


    case 'financial_metrics': {
      if (!financialMetricsData) return null;
      const { m, epsHistory, quarterly, radarData, metricCards } = financialMetricsData;

      return (
        <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
          {/* 지표 카드 그리드 */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>핵심 재무 지표</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
              {metricCards.map((c, i) => (
                <MetricCard key={i} {...c} onClick={() => {
                  if (c.sparkData && c.sparkData.length > 0) {
                    openWindow(c);
                  }
                }} />
              ))}
            </div>
          </div>

          {/* 레이더 + EPS 추이 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>재무 역량 레이더</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill:'#94a3b8', fontSize:10 }} />
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill:'#475569', fontSize:9 }} />
                  <Radar name="재무지표" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`${v.toFixed(0)}점`, '스코어']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>연도별 EPS 추이</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={epsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`₩${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`₩${v.toLocaleString()}`, 'EPS']} cursor={false} />
                  <Bar dataKey="eps" fill="#8b5cf6" radius={[6,6,0,0]} isAnimationActive={false} activeBar={false}
                    shape={(props:any) => <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="#8b5cf6" rx={6} />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 분기별 매출 & 영업이익 */}
          {quarterly.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>분기별 매출 & 영업이익</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={quarterly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="period" tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v:number, n:string) => [`₩${v.toLocaleString()}`, n==='revenue'?'매출':'영업이익']} cursor={false} />
                  <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} name="매출" isAnimationActive={false} activeBar={false}
                    shape={(props:any) => <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="#6366f1" rx={4} />}
                  />
                  <Bar dataKey="operatingProfit" fill="#10b981" radius={[4,4,0,0]} name="영업이익" isAnimationActive={false} activeBar={false}
                    shape={(props:any) => <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="#10b981" rx={4} />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 이동 가능한 윈도우들 */}
          {openWindows.map(win => (
            <DraggableMetricWindow 
              key={win.id} 
              win={win} 
              onClose={() => closeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
              onMove={(x,y) => updatePos(win.id, x, y)}
            />
          ))}
        </div>
      );
    }


    case 'market_indicators': {
      const history = ((d.history as {date:string;value:number}[] | undefined) ?? []).slice(-90);
      const sectors = (d.sectorPerformance as {sector:string;changePercent:number}[] | undefined) ?? [];
      return (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>지수 추이 (90일)</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} tickLine={false} />
                <YAxis domain={['auto','auto']} tick={{ fill:'#475569', fontSize:11 }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#mktGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>섹터별 등락률</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sectors} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false} />
                <XAxis type="number" tick={{ fill:'#475569', fontSize:11 }} tickFormatter={v=>`${v}%`} />
                <YAxis dataKey="sector" type="category" tick={{ fill:'#94a3b8', fontSize:11 }} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`${v}%`,'등락률']} />
                <Bar dataKey="changePercent" radius={[0,4,4,0]}>
                  {sectors.map((s,i) => <Cell key={i} fill={s.changePercent >= 0 ? '#10b981' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    case 'bonds': {
      const curve = (d.yieldCurve as {maturity:string;yield:number}[] | undefined) ?? [];
      const hist = ((d.yieldHistory as {date:string;yield:number}[] | undefined) ?? []).slice(-90);
      return (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>수익률 곡선</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="maturity" tick={{ fill:'#475569', fontSize:11 }} />
                <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`${v}%`,'금리']} />
                <Line type="monotone" dataKey="yield" stroke="#84cc16" strokeWidth={2} dot={{ fill:'#84cc16', r:4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>수익률 추이</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={hist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} tickLine={false} />
                <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} domain={['auto','auto']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="yield" stroke="#eab308" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    case 'commodities':
    case 'forex':
    case 'crypto': {
      const key = data.category === 'crypto' ? 'priceHistory' : data.category === 'forex' ? 'history' : 'priceHistory';
      const priceKey = data.category === 'forex' ? 'rate' : 'price';
      const color = data.category === 'crypto' ? '#ef4444' : data.category === 'forex' ? '#f97316' : '#eab308';
      const history = ((d[key] as Record<string,number>[] | undefined) ?? []).slice(-90);
      return (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>최근 90일 추이</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} tickLine={false} />
              <YAxis domain={['auto','auto']} tick={{ fill:'#475569', fontSize:11 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey={priceKey} stroke={color} fill="url(#genGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case 'macro': {
      const hist = (d.history as Record<string,number|string>[] | undefined) ?? [];
      return (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>주요 경제 지표 추이</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} tickLine={false} />
              <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
              <Line type="monotone" dataKey="gdpGrowth" stroke="#6366f1" strokeWidth={2} dot={false} name="GDP성장률" />
              <Line type="monotone" dataKey="cpi" stroke="#ef4444" strokeWidth={2} dot={false} name="CPI" />
              <Line type="monotone" dataKey="unemploymentRate" stroke="#f59e0b" strokeWidth={2} dot={false} name="실업률" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case 'trade': {
      const trades = (d.trades as {date:string;side:string;amount:number;name:string}[] | undefined) ?? [];
      const byDate: Record<string,{buy:number;sell:number}> = {};
      trades.forEach(t => {
        if (!byDate[t.date]) byDate[t.date] = {buy:0,sell:0};
        if (t.side==='buy') byDate[t.date].buy += t.amount;
        else byDate[t.date].sell += t.amount;
      });
      const chartData = Object.entries(byDate).slice(-30).map(([date,v]) => ({date,...v}));
      return (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>일별 매수/매도 금액</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} tickLine={false} />
              <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickFormatter={v=>fmtNum(v,'₩')} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v:number,n:string) => [fmtNum(v,'₩'), n==='buy'?'매수':'매도']} />
              <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
              <Bar dataKey="buy" fill="#10b981" radius={[4,4,0,0]} name="매수" />
              <Bar dataKey="sell" fill="#ef4444" radius={[4,4,0,0]} name="매도" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case 'dividend': {
      const hist = ((d.dividendHistory as {exDate:string;amount:number}[] | undefined) ?? []).slice(-12);
      return (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>배당금 이력</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="exDate" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} />
              <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`₩${v}`, '배당금']} />
              <Bar dataKey="amount" fill="#a855f7" radius={[4,4,0,0]} name="배당금" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case 'derivatives': {
      const chain = (d.optionChain as {strike:number;callIV:number;putIV:number;callOI:number;putOI:number}[] | undefined) ?? [];
      return (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>옵션 내재 변동성 (IV) by 행사가</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chain}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="strike" tick={{ fill:'#475569', fontSize:11 }} />
              <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickFormatter={v=>`${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v:number,n:string) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
              <Line type="monotone" dataKey="callIV" stroke="#10b981" strokeWidth={2} dot={{ r:3 }} name="콜 IV" />
              <Line type="monotone" dataKey="putIV" stroke="#ef4444" strokeWidth={2} dot={{ r:3 }} name="풋 IV" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case 'funds': {
      const navHist = ((d.navHistory as {date:string;nav:number}[] | undefined) ?? []).slice(-90);
      return (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>NAV 추이 (90일)</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={navHist}>
              <defs>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} tickLine={false} />
              <YAxis domain={['auto','auto']} tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickFormatter={v=>`₩${v.toLocaleString()}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`₩${v.toLocaleString()}`, 'NAV']} />
              <Area type="monotone" dataKey="nav" stroke="#0ea5e9" fill="url(#fundGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case 'reits': {
      const priceHist = ((d.priceHistory as {date:string;price:number}[] | undefined) ?? []).slice(-90);
      const breakdown = (d.propertyBreakdown as {type:string;weight:number}[] | undefined) ?? [];
      return (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>주가 추이</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={priceHist}>
                <defs>
                  <linearGradient id="reitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'#475569', fontSize:11 }} tickLine={false} />
                <YAxis domain={['auto','auto']} tick={{ fill:'#475569', fontSize:11 }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="price" stroke="#22c55e" fill="url(#reitGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>자산 유형 구성</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={breakdown} dataKey="weight" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={({type,weight})=>`${type} ${weight}%`}>
                  {breakdown.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v:number) => [`${v}%`, '비중']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    case 'dynamic': {
      const blocks = (d.blocks as any[]) ?? [];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px' }}>
          {blocks.map((block, i) => (
            <DynamicBlock key={block.id || i} block={block} openWindow={openWindow} />
          ))}
          
          {/* 이동 가능한 윈도우들 (동적 분석 모드에서도 지원) */}
          {openWindows.map(win => (
            <DraggableMetricWindow 
              key={win.id} 
              win={win} 
              onClose={() => closeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
              onMove={(x,y) => updatePos(win.id, x, y)}
            />
          ))}
        </div>
      );
    }

    default:
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            <span>ℹ️</span>
            <span>이 데이터에 최적화된 전용 차트가 아직 준비되지 않아 상세 표 형태로 표시합니다.</span>
          </div>
          <TableView data={d} />
        </div>
      );
  }
}

// ─── 이동 가능한 윈도우 컴포넌트 ───────────────────────────────────
function DraggableMetricWindow({ win, onClose, onFocus, onMove }: { 
  win: any, onClose: () => void, onFocus: () => void, onMove: (x:number, y:number) => void 
}) {
  const isDragging = useRef(false);
  const startPos = useRef({ x:0, y:0 });

  const onMouseDown = (e: React.MouseEvent) => {
    onFocus();
    isDragging.current = true;
    startPos.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    
    const handleMouseMove = (em: MouseEvent) => {
      if (isDragging.current) {
        onMove(em.clientX - startPos.current.x, em.clientY - startPos.current.y);
      }
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      style={{
        position:'fixed', left: win.x, top: win.y, zIndex: win.zIndex,
        width: 440, background:'rgba(15,23,42,0.92)', border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:16, padding:20, boxShadow:'0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter:'blur(10px)', pointerEvents:'auto'
      }}
      onMouseDown={onFocus}
    >
      <div 
        onMouseDown={onMouseDown}
        style={{ 
          display:'flex', justifyContent:'space-between', alignItems:'flex-start', 
          marginBottom:16, cursor:'move', paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,0.05)' 
        }}
      >
        <div>
          <h3 style={{ fontSize:18, fontWeight:800, color:'white', marginBottom:4 }}>
            {win.label} 추이
            <span style={{ fontSize:14, fontWeight:700, color:win.hintColor !== '#94a3b8' && win.hintColor !== '-' ? win.hintColor : 'white', marginLeft: 10 }}>
              {win.value}{win.unit}
            </span>
          </h3>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.3, maxWidth:340 }}>{win.desc}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:18, padding:4 }}
        >✕</button>
      </div>
      
      <div style={{ height: 180, width: '100%', marginTop:10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={win.sparkData.map((val:any, idx:number) => ({ val, period: `M-${idx+1}` }))} margin={{ top:5, right:5, bottom:0, left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="period" tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip 
              contentStyle={{ background:'rgba(10,14,26,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize: 11 }}
              formatter={(v:number) => [v.toFixed(2), win.label]}
            />
            <Area 
              type="monotone" dataKey="val" 
              stroke={win.hintColor !== '#94a3b8' && win.hintColor !== '-' ? win.hintColor : '#8b5cf6'} 
              fill={win.hintColor !== '#94a3b8' && win.hintColor !== '-' ? win.hintColor : '#8b5cf6'} 
              fillOpacity={0.2} strokeWidth={2.5} 
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── 동적 대시보드 블록 렌더러 ─────────────────────────────────────
function DynamicBlock({ block, openWindow }: { block: any, openWindow: (m: any) => void }) {
  const colSpan = block.layout === 'full' ? 'span 6' : block.layout === 'half' ? 'span 3' : 'span 2';
  
  return (
    <div style={{
      gridColumn: colSpan,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {block.title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{block.title}</h3>
          {block.description && (
             <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{block.description}</div>
          )}
        </div>
      )}
      
      <div style={{ flex: 1, minHeight: '100px' }}>
        {renderBlockContent(block, openWindow)}
      </div>
    </div>
  );
}

function renderBlockContent(block: any, openWindow: (m: any) => void) {
  const tooltipStyle = {
    background: 'rgba(10, 14, 26, 0.95)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '12px',
  };

  switch (block.type) {
    case 'metrics':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {block.data.map((m: any, i: number) => (
            <MetricCard 
              key={i} 
              label={m.label} 
              value={m.value} 
              unit={m.unit} 
              hint={m.change || '-'} 
              hintColor={m.changeColor || '#94a3b8'} 
              desc={m.desc || ''} 
              sparkData={m.sparkData}
              onClick={() => m.sparkData ? openWindow(m) : undefined}
            />
          ))}
        </div>
      );

    case 'chart':
      const chartType = block.config?.chartType || 'line';
      let xKey = block.config?.xAxisKey || 'date';
      let yKey = block.config?.yAxisKey || 'value';
      let nameKey = block.config?.nameKey || 'name';
      let valueKey = block.config?.valueKey || 'value';
      
      // Auto-detect keys if they don't match the data
      if (block.data && block.data.length > 0) {
        const dataKeys = Object.keys(block.data[0]);
        if (!dataKeys.includes(xKey)) {
          xKey = dataKeys.find(k => typeof block.data[0][k] === 'string') || dataKeys[0];
        }
        if (!dataKeys.includes(yKey)) {
          yKey = dataKeys.find(k => typeof block.data[0][k] === 'number') || dataKeys[dataKeys.length > 1 ? 1 : 0];
        }
        if (!dataKeys.includes(nameKey)) nameKey = xKey;
        if (!dataKeys.includes(valueKey)) valueKey = yKey;
      }
      
      return (
        <ResponsiveContainer width="100%" height={220}>
          {chartType === 'line' ? (
            <LineChart data={block.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey={yKey} stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={block.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey={yKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie 
                data={block.data} 
                dataKey={valueKey} 
                nameKey={nameKey} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                innerRadius={50}
                label={({[nameKey]: n, [valueKey]: v}) => `${n} (${v}%)`}
                labelLine={false}
              >
                {block.data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          ) : (
            <AreaChart data={block.data}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
               <XAxis dataKey={xKey} tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
               <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
               <Tooltip contentStyle={tooltipStyle} />
               <Area type="monotone" dataKey={yKey} stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      );

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={block.data}>
            <PolarGrid stroke="rgba(255,255,255,0.07)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill:'#94a3b8', fontSize:10 }} />
            <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      );

    case 'ranking':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {block.data.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{i+1}</div>
              <div style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1' }}>{item.value}</div>
            </div>
          ))}
        </div>
      );

    case 'table':
      return <TableView data={block.data} />;

    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
          지원하지 않는 시각화 조각입니다.
        </div>
      );
  }
}

function TableView({ data }: { data: any }) {
  if (!data) return null;

  // Case 1: Array of objects (Standard table)
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const keys = Object.keys(data[0]);
    return (
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              {keys.map(k => (
                <th key={k} style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {keys.map(k => (
                  <td key={k} style={{ padding: '12px 16px' }}>
                    {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Case 2: Simple object (Key-Value table)
  if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data).filter(([_, v]) => typeof v !== 'object' || v === null);
    if (entries.length === 0) return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>표시할 데이터가 없습니다.</div>;
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>지원하지 않는 데이터 형식입니다.</div>;
}
