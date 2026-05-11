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
  '주식':'var(--accent)','ETF':'var(--brand-blue)','채권':'#06b6d4','원자재':'#f59e0b',
  '암호화폐':'var(--danger)','외환':'#f97316','리츠':'#22c55e','현금':'#94a3b8',
};

const CAT_COLORS: Record<string,string> = {
  stock:'var(--accent)', etf:'var(--brand-blue)', bonds:'#06b6d4',
  commodities:'#f59e0b', crypto:'var(--danger)', forex:'#f97316',
  reits:'#22c55e',
};

const pfTooltipStyle = {
  backgroundColor:'#FFFFFF', border:'1px solid var(--border)',
  borderRadius:12, color:'#1A1A1A', fontSize:12, padding:'10px 14px',
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
  const lineColor = isUp ? 'var(--success)' : 'var(--danger)';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* ── 성과 차트 ── */}
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>성과 추이 vs 벤치마크</span>
            <span style={{ fontSize:13, fontWeight:700, color: lineColor }}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>({period} 기준)</span>
          </div>
          {/* 기간 선택 */}
          <div style={{ display:'flex', background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:10, padding:3, gap:2 }}>
            {PF_PERIODS.map(({ label }) => (
              <button key={label} onClick={() => setPeriod(label)} style={{
                padding:'5px 12px', fontSize:12, fontWeight:600, borderRadius:8, border:'none', cursor:'pointer',
                background: period === label ? 'var(--brand-green-soft)' : 'transparent',
                color: period === label ? 'var(--brand-green-dark)' : 'var(--text-secondary)',
                transition:'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={filtered} margin={{ top:4, right:8, bottom:0, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date" tickFormatter={fmtPfDate}
              tick={{ fill:'var(--text-muted)', fontSize:10 }} tickLine={false} axisLine={false}
              interval={Math.max(1, Math.floor(filtered.length/10))}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={fmtPfMoney}
              tick={{ fill:'var(--text-muted)', fontSize:10 }} tickLine={false} axisLine={false}
              orientation="right" width={80}
            />
            <Tooltip
              contentStyle={pfTooltipStyle}
              formatter={(v: any, n: any) => [fmtPfMoney(v as number), n as string]}
              labelFormatter={(d: any) => fmtPfDate(d as string)}
            />
            <Legend wrapperStyle={{ color:'var(--text-secondary)', fontSize:12 }} />
            <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2.5} dot={false} name="포트폴리오" />
            <Line type="monotone" dataKey="benchmark" stroke="var(--brand-blue)" strokeWidth={1.5} dot={false} name="벤치마크" strokeDasharray="5 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── 자산 배분 도넛 + 종목별 수익률 바 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <div>
          <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>자산 배분</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={alloc} dataKey="weight" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                label={(props: any) => `${props.category} ${props.weight}%`} labelLine={false}>
                {alloc.map((a,i) => <Cell key={i} fill={ALLOC_COLORS[a.category] ?? `hsl(${i*40},70%,55%)`} />)}
              </Pie>
              <Tooltip contentStyle={pfTooltipStyle} formatter={(v: any) => [`${v}%`, '비중']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>보유 종목별 수익률</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={holdings} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:10 }} tickFormatter={v=>`${v}%`} />
              <YAxis dataKey="asset" type="category" tick={{ fill:'var(--text-secondary)', fontSize:10 }} width={90} />
              <Tooltip contentStyle={pfTooltipStyle} formatter={(v: any) => [`${v > 0 ? '+' : ''}${v}%`, '수익률']} cursor={false} />
              <Bar dataKey="returnRate" isAnimationActive={false} activeBar={false}
                shape={(props:any) => (
                  <rect x={props.x} y={props.y} width={Math.abs(props.width)} height={props.height}
                    fill={props.value >= 0 ? 'var(--success)' : 'var(--danger)'} rx={4}
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
                  background:'var(--bg-secondary)', border:'1px solid var(--border)',
                  borderRadius:14, padding:'16px 18px',
                  borderLeft: `3px solid ${catColor}`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{h.asset}</span>
                    <span style={{
                      fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6,
                      background: `${catColor}22`, color: catColor
                    }}>{h.category}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>평가금액</p>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{fmtPfMoney(h.value)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>비중</p>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{h.weight}%</p>
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>수익률</p>
                      <p style={{ fontSize:15, fontWeight:800, color: isHUp ? 'var(--success)' : 'var(--danger)' }}>
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
      background:'var(--bg-secondary)', border:'1px solid var(--border)',
      borderRadius:12, padding:'14px 16px', position:'relative',
      zIndex: showTip ? 50 : 1, transition: 'background 0.2s, z-index 0s',
      cursor: onClick ? 'pointer' : 'default'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
    >
      {/* 라벨 행: 라벨 왼쪽 / ⓘ+뱃지 오른쪽 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600 }}>{label}</span>
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
                border:'1px solid var(--border-light)', fontSize:10,
                color:'var(--text-muted)', fontWeight:700,
                userSelect:'none',
              }}>i</span>
              {showTip && (
                <div style={{
                  position:'absolute', 
                  ...(tipPos === 'top' ? { bottom:'calc(100% + 8px)' } : { top:'calc(100% + 8px)' }),
                  right:-8, width: 220,
                  background:'#FFFFFF', border:'1px solid var(--border)',
                  borderRadius:8, padding:'10px 14px', whiteSpace:'normal', wordBreak:'keep-all',
                  fontSize:12, color:'var(--text-primary)', zIndex:999,
                  boxShadow:'var(--shadow-card)',
                  pointerEvents:'none', lineHeight:1.45
                }}>
                  {desc}
                  <div style={{
                    position:'absolute', 
                    ...(tipPos === 'top' ? { top:'100%' } : { bottom:'100%' }),
                    right:10, width:0, height:0,
                    borderLeft:'6px solid transparent', borderRight:'6px solid transparent',
                    [tipPos === 'top' ? 'borderTop' : 'borderBottom']:'6px solid var(--border)',
                  }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* 값 & 미니 그래프 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <p style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', paddingRight:8 }}>
          {value}<span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:2 }}>{unit}</span>
        </p>
        {sparkData && sparkData.length > 0 && value !== '-' && (
          <div style={{ width: 64, height: 28, opacity: 0.85, flexShrink: 0 }}>
            <Sparkline data={sparkData} color={hintColor !== '#94a3b8' && hintColor !== '-' ? hintColor : 'var(--brand-blue)'} width="100%" height="100%" />
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
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} />
        <YAxis dataKey="name" type="category" tick={{ fill:'var(--text-secondary)', fontSize:11 }} width={100} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, '비중']} cursor={false} />
        <Bar
          dataKey="weight"
          fill="var(--brand-blue)"
          radius={[0,4,4,0]}
          isAnimationActive={false}
          activeBar={false}
          shape={(props: any) => (
            <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="var(--brand-blue)" rx={4} />
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

const COLORS = ['var(--accent)','var(--brand-blue)','#06b6d4','var(--brand-green-dark)','#f59e0b','var(--danger)','#14b8a6','#0ea5e9'];

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
  const d = data.data as any;
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
      { label:'PER', value: m.peRatio?.toFixed(1) ?? '-', unit:'배', desc:'주가가 회사의 1년 순이익의 몇 배인지 나타냅니다. 낮을수록 저평가되어 있습니다.', hint: m.peRatio ? (m.peRatio < 15 ? '저평가' : m.peRatio < 25 ? '적정' : '고평가') : '-', hintColor: m.peRatio ? (m.peRatio < 15 ? 'var(--success)' : m.peRatio < 25 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', sparkData: genSpark(m.peRatio, m.peRatio && m.peRatio < 15 ? 'down' : 'flat') },
      { label:'PBR', value: m.pbr?.toFixed(2) ?? '-', unit:'배', desc:'회사의 순자산(가진 돈) 대비 주가가 몇 배인지 나타냅니다. 1 미만이면 회사를 다 팔아도 남는 장사라는 뜻입니다.', hint: m.pbr ? (m.pbr < 1 ? '저평가' : m.pbr < 2 ? '적정' : '고평가') : '-', hintColor: m.pbr ? (m.pbr < 1 ? 'var(--success)' : m.pbr < 2 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', sparkData: genSpark(m.pbr, 'flat') },
      { label:'ROE', value: m.roe?.toFixed(1) ?? '-', unit:'%', desc:'주주의 돈(자본)을 굴려서 1년에 몇 %의 수익을 냈는지 보여줍니다. 높을수록 장사를 잘하는 곳입니다.', hint: m.roe ? (m.roe >= 15 ? '우수' : m.roe >= 8 ? '양호' : '주의') : '-', hintColor: m.roe ? (m.roe >= 15 ? 'var(--success)' : m.roe >= 8 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', sparkData: genSpark(m.roe, m.roe && m.roe >= 15 ? 'up' : 'flat') },
      { label:'ROA', value: m.roa?.toFixed(1) ?? '-', unit:'%', desc:'회사가 가진 모든 자산(빚 포함)을 활용해 얼만큼의 수익을 냈는지 보여줍니다.', hint: m.roa ? (m.roa >= 8 ? '우수' : m.roa >= 4 ? '양호' : '주의') : '-', hintColor: m.roa ? (m.roa >= 8 ? 'var(--success)' : m.roa >= 4 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', sparkData: genSpark(m.roa, 'flat') },
      { label:'영업이익률', value: m.operatingMargin?.toFixed(1) ?? '-', unit:'%', desc:'물건을 팔고 남은 순수한 장사 이윤이 몇 %인지 나타냅니다.', hint: m.operatingMargin ? (m.operatingMargin >= 15 ? '우수' : m.operatingMargin >= 8 ? '양호' : '주의') : '-', hintColor: m.operatingMargin ? (m.operatingMargin >= 15 ? 'var(--success)' : m.operatingMargin >= 8 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', sparkData: genSpark(m.operatingMargin, 'up') },
      { label:'순이익률', value: m.netMargin?.toFixed(1) ?? '-', unit:'%', desc:'모든 비용과 세금까지 다 떼고 최종적으로 회사 주머니에 남은 수익 비율입니다.', hint: '-', hintColor: '#94a3b8', sparkData: genSpark(m.netMargin, 'up') },
      { label:'부채비율', value: m.debtRatio?.toFixed(0) ?? '-', unit:'%', desc:'내 돈(자본) 대비 남의 돈(빚)이 얼마나 되는지 나타냅니다. 낮을수록 안전합니다.', hint: m.debtRatio ? (m.debtRatio < 50 ? '안정' : m.debtRatio < 100 ? '양호' : '주의') : '-', hintColor: m.debtRatio ? (m.debtRatio < 50 ? 'var(--success)' : m.debtRatio < 100 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', sparkData: genSpark(m.debtRatio, m.debtRatio && m.debtRatio > 100 ? 'up' : 'down') },
      { label:'매출성장률', value: m.revenueGrowth?.toFixed(1) ?? '-', unit:'%', desc:'작년보다 물건을 얼마나 더 많이 팔았는지 나타냅니다.', hint: m.revenueGrowth ? (m.revenueGrowth >= 10 ? '고성장' : m.revenueGrowth >= 0 ? '성장' : '역성장') : '-', hintColor: m.revenueGrowth ? (m.revenueGrowth >= 10 ? 'var(--success)' : m.revenueGrowth >= 0 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', sparkData: genSpark(m.revenueGrowth, 'flat') },
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, alignItems: 'center' }}>
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>섹터 비중</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={sectors} dataKey="weight" nameKey="sector" cx="50%" cy="50%" outerRadius={100} label={(props: any)=>`${props.sector} ${props.weight}%`} labelLine={false}>
                      {sectors.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, '비중']} />
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            <div>
              <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>재무 역량 레이더</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill:'var(--text-secondary)', fontSize:10 }} />
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill:'var(--text-muted)', fontSize:9 }} />
                  <Radar name="재무지표" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v.toFixed(0)}점`, '스코어']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>연도별 EPS 추이</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={epsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`₩${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`₩${v.toLocaleString()}`, 'EPS']} cursor={false} />
                  <Bar dataKey="eps" fill="var(--brand-blue)" radius={[6,6,0,0]} isAnimationActive={false} activeBar={false}
                    shape={(props:any) => <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="var(--brand-blue)" rx={6} />}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="period" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [`₩${v.toLocaleString()}`, n==='revenue'?'매출':'영업이익']} cursor={false} />
                  <Legend wrapperStyle={{ color:'var(--text-secondary)', fontSize:12 }} />
                  <Bar dataKey="revenue" fill="var(--accent)" radius={[4,4,0,0]} name="매출" isAnimationActive={false} activeBar={false}
                    shape={(props:any) => <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="var(--accent)" rx={4} />}
                  />
                  <Bar dataKey="operatingProfit" fill="var(--success)" radius={[4,4,0,0]} name="영업이익" isAnimationActive={false} activeBar={false}
                    shape={(props:any) => <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="var(--success)" rx={4} />}
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
      const breadth = (d.breadth as {advancing?:number;declining?:number;unchanged?:number} | undefined) ?? {};
      const addl = (d.additionalIndicators as Record<string,number> | undefined) ?? {};
      const breadthTotal = (breadth.advancing ?? 0) + (breadth.declining ?? 0) + (breadth.unchanged ?? 0);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {(history.length > 0 || sectors.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: history.length > 0 && sectors.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>
              {history.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>지수 추이 (90일)</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} tickLine={false} />
                      <YAxis domain={['auto','auto']} tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="value" stroke="var(--success)" fill="url(#mktGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {sectors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>섹터별 등락률</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={sectors} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} tickFormatter={v=>`${v > 0 ? '+' : ''}${v}%`} />
                      <YAxis dataKey="sector" type="category" tick={{ fill:'var(--text-secondary)', fontSize:11 }} width={72} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v > 0 ? '+' : ''}${v}%`,'등락률']} />
                      <Bar dataKey="changePercent" radius={[0,4,4,0]} maxBarSize={20}>
                        {sectors.map((s,i) => <Cell key={i} fill={s.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
          {(breadthTotal > 0 || addl.fearGreedIndex != null) && (
            <div style={{ display: 'grid', gridTemplateColumns: breadthTotal > 0 && addl.fearGreedIndex != null ? '1fr 1fr' : '1fr', gap: 16 }}>
              {breadthTotal > 0 && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '20px 24px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '0.05em' }}>시장 폭 (Market Breadth)</p>
                  <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ width: `${((breadth.advancing ?? 0)/breadthTotal)*100}%`, background: 'var(--success)', transition: 'width 0.5s' }} />
                    <div style={{ width: `${((breadth.unchanged ?? 0)/breadthTotal)*100}%`, background: '#475569' }} />
                    <div style={{ width: `${((breadth.declining ?? 0)/breadthTotal)*100}%`, background: 'var(--danger)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--brand-green-dark)', fontWeight: 700 }}>↑ 상승 {breadth.advancing ?? '-'}종목</span>
                    <span>변동없음 {breadth.unchanged ?? '-'}</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>↓ 하락 {breadth.declining ?? '-'}종목</span>
                  </div>
                </div>
              )}
              {addl.fearGreedIndex != null && (() => {
                const fg = addl.fearGreedIndex;
                const fgColor = fg < 25 ? 'var(--danger)' : fg < 45 ? 'var(--warning)' : fg < 55 ? 'var(--text-muted)' : fg < 75 ? 'var(--success)' : 'var(--brand-blue)';
                const fgLabel = fg < 25 ? '극도의 공포' : fg < 45 ? '공포' : fg < 55 ? '중립' : fg < 75 ? '탐욕' : '극도의 탐욕';
                return (
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '20px 24px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '0.05em' }}>공포·탐욕 지수 (Fear & Greed)</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ width: 72, height: 72, borderRadius: '50%', border: `4px solid ${fgColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: fgColor }}>{fg}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: fgColor, marginBottom: 4 }}>{fgLabel}</p>
                        {addl.putCallRatio != null && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Put/Call Ratio: <strong style={{color:'var(--text-primary)'}}>{addl.putCallRatio}</strong></p>}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      );
    }

    case 'bonds': {
      const curve = (d.yieldCurve as {maturity:string;yield:number}[] | undefined) ?? [];
      const hist = ((d.yieldHistory as {date:string;yield:number}[] | undefined) ?? []).slice(-90);
      const metrics = [
        { label: '표면금리', value: (d as any).couponRate?.toFixed(2) ?? '-', unit: '%', desc: '채권의 이자율입니다.' },
        { label: '현재수익률', value: (d as any).currentYield?.toFixed(2) ?? '-', unit: '%', desc: '현재 가격 대비 이자 수익률입니다.' },
        { label: '만기수익률(YTM)', value: (d as any).yieldToMaturity?.toFixed(2) ?? '-', unit: '%', desc: '만기까지 보유했을 때의 연평균 수익률입니다.', sparkData: hist.map(h => h.yield) },
        { label: '듀레이션', value: (d as any).duration?.toFixed(2) ?? '-', unit: '년', desc: '금리 변화에 대한 가격 민감도입니다.' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.some(m => m.value !== '-') && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>핵심 채권 지표</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint="-" hintColor="#94a3b8" onClick={() => c.sparkData && openWindow(c)} />)}
              </div>
            </div>
          )}
          {(curve.length > 0 || hist.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: curve.length > 0 && hist.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>
              {curve.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>수익률 곡선</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={curve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="maturity" tick={{ fill:'var(--text-muted)', fontSize:11 }} />
                      <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickFormatter={v=>`${v}%`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`,'금리']} />
                      <Line type="monotone" dataKey="yield" stroke="#84cc16" strokeWidth={2} dot={{ fill:'#84cc16', r:4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {hist.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>수익률 추이</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={hist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} tickLine={false} />
                      <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} domain={['auto','auto']} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="yield" stroke="#eab308" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
          {openWindows.map(win => (
            <DraggableMetricWindow key={win.id} win={win} onClose={() => closeWindow(win.id)} onFocus={() => focusWindow(win.id)} onMove={(x,y) => updatePos(win.id, x, y)} />
          ))}
        </div>
      );
    }

    case 'commodities':
    case 'forex':
    case 'crypto': {
      const key = data.category === 'crypto' ? 'priceHistory' : data.category === 'forex' ? 'history' : 'priceHistory';
      const priceKey = data.category === 'forex' ? 'rate' : 'price';
      const color = data.category === 'crypto' ? 'var(--danger)' : data.category === 'forex' ? '#f97316' : '#eab308';
      const history = ((d[key] as Record<string,number>[] | undefined) ?? []).slice(-90);
      
      const metrics = data.category === 'crypto' ? [
        { label: '현재가', value: d.currentPrice?.toLocaleString() ?? '-', unit: '$', desc: '현재 거래 가격입니다.', sparkData: history.map(h => h.price) },
        { label: '시가총액', value: d.marketCap ? (d.marketCap/1e9).toFixed(2) : '-', unit: 'B', desc: '총 발행량에 현재가를 곱한 값입니다.' },
        { label: '24시간 거래량', value: d.volume24h ? (d.volume24h/1e6).toFixed(2) : '-', unit: 'M', desc: '최근 24시간 동안의 거래 규모입니다.' },
        { label: '24시간 변동률', value: d.change24h?.toFixed(2) ?? '-', unit: '%', desc: '전일 대비 가격 변동률입니다.', hint: d.change24h ? (d.change24h > 0 ? '상승' : '하락') : '-', hintColor: d.change24h ? (d.change24h > 0 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' },
      ] : data.category === 'forex' ? [
        { label: '현재 환율', value: d.currentRate?.toLocaleString() ?? '-', unit: '', desc: '현재 적용되는 환율입니다.', sparkData: history.map(h => h.rate) },
        { label: '변동률', value: d.changePercent?.toFixed(2) ?? '-', unit: '%', desc: '전일 대비 변동률입니다.', hint: d.changePercent ? (d.changePercent > 0 ? '상승' : '하락') : '-', hintColor: d.changePercent ? (d.changePercent > 0 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' },
        { label: '매수호가(Bid)', value: d.bid?.toLocaleString() ?? '-', unit: '', desc: '시장에서 매수하려는 최고 가격입니다.' },
        { label: '매도호가(Ask)', value: d.ask?.toLocaleString() ?? '-', unit: '', desc: '시장에서 매도하려는 최저 가격입니다.' },
      ] : [
        { label: '현재가', value: d.currentPrice?.toLocaleString() ?? '-', unit: '$', desc: '원자재의 현재 가격입니다.', sparkData: history.map(h => h.price) },
        { label: '변동률', value: d.changePercent?.toFixed(2) ?? '-', unit: '%', desc: '전일 대비 변동률입니다.', hint: d.changePercent ? (d.changePercent > 0 ? '상승' : '하락') : '-', hintColor: d.changePercent ? (d.changePercent > 0 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' },
      ];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.some(m => m.value !== '-') && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>주요 지표</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint={c.hint ?? '-'} hintColor={c.hintColor ?? "#94a3b8"} onClick={() => c.sparkData && openWindow(c)} />)}
              </div>
            </div>
          )}
          {history.length > 0 && (
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
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} tickLine={false} />
                  <YAxis domain={['auto','auto']} tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey={priceKey} stroke={color} fill="url(#genGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {openWindows.map(win => (
            <DraggableMetricWindow key={win.id} win={win} onClose={() => closeWindow(win.id)} onFocus={() => focusWindow(win.id)} onMove={(x,y) => updatePos(win.id, x, y)} />
          ))}
        </div>
      );
    }

    case 'macro': {
      const hist = (d.history as Record<string,number|string>[] | undefined) ?? [];
      const metrics = [
        { label: 'GDP성장률', value: d.gdp?.toFixed(2) ?? '-', unit: '%', desc: '국내총생산의 성장률입니다.', sparkData: hist.map(h => h.gdpGrowth as number) },
        { label: '소비자물가지수(CPI)', value: d.cpi?.toFixed(2) ?? '-', unit: '%', desc: '소비자가 구입하는 상품과 서비스의 가격 변동입니다.', sparkData: hist.map(h => h.cpi as number) },
        { label: '실업률', value: d.unemploymentRate?.toFixed(2) ?? '-', unit: '%', desc: '경제활동인구 중 실업자의 비율입니다.', sparkData: hist.map(h => h.unemploymentRate as number) },
        { label: '기준금리', value: d.interestRate?.toFixed(2) ?? '-', unit: '%', desc: '중앙은행이 결정하는 정책 금리입니다.', sparkData: hist.map(h => h.interestRate as number) },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.some(m => m.value !== '-') && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>주요 경제 지표</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint="-" hintColor="#94a3b8" onClick={() => c.sparkData && openWindow(c)} />)}
              </div>
            </div>
          )}
          {hist.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>경제 지표 시계열 추이</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color:'var(--text-secondary)', fontSize:12 }} />
                  <Line type="monotone" dataKey="gdpGrowth" stroke="var(--accent)" strokeWidth={2} dot={false} name="GDP성장률" />
                  <Line type="monotone" dataKey="cpi" stroke="var(--danger)" strokeWidth={2} dot={false} name="CPI" />
                  <Line type="monotone" dataKey="unemploymentRate" stroke="#f59e0b" strokeWidth={2} dot={false} name="실업률" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {openWindows.map(win => (
            <DraggableMetricWindow key={win.id} win={win} onClose={() => closeWindow(win.id)} onFocus={() => focusWindow(win.id)} onMove={(x,y) => updatePos(win.id, x, y)} />
          ))}
        </div>
      );
    }

    case 'trade': {
      const trades = (d.trades as {date:string;side:string;amount:number;name:string}[] | undefined) ?? [];
      const byDate: Record<string,{buy:number;sell:number}> = {};
      let totalBuy = 0; let totalSell = 0;
      trades.forEach(t => {
        if (!byDate[t.date]) byDate[t.date] = {buy:0,sell:0};
        if (t.side==='buy') { byDate[t.date].buy += t.amount; totalBuy += t.amount; }
        else { byDate[t.date].sell += t.amount; totalSell += t.amount; }
      });
      const chartData = Object.entries(byDate).slice(-30).map(([date,v]) => ({date,...v}));
      const metrics = [
        { label: '총 매수금액', value: (totalBuy/10000).toFixed(0), unit: '만', desc: '기간 내 총 매수 금액입니다.' },
        { label: '총 매도금액', value: (totalSell/10000).toFixed(0), unit: '만', desc: '기간 내 총 매도 금액입니다.' },
        { label: '순매수금액', value: ((totalBuy - totalSell)/10000).toFixed(0), unit: '만', desc: '매수 금액에서 매도 금액을 뺀 값입니다.', hint: totalBuy >= totalSell ? '순매수' : '순매도', hintColor: totalBuy >= totalSell ? 'var(--success)' : 'var(--danger)' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {trades.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>거래 요약</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint={c.hint ?? "-"} hintColor={c.hintColor ?? "#94a3b8"} />)}
              </div>
            </div>
          )}
          {chartData.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>일별 매수/매도 금액</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickFormatter={v=>fmtNum(v,'₩')} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any,n: any) => [fmtNum(v,'₩'), n==='buy'?'매수':'매도']} />
                  <Legend wrapperStyle={{ color:'var(--text-secondary)', fontSize:12 }} />
                  <Bar dataKey="buy" fill="var(--success)" radius={[4,4,0,0]} name="매수" />
                  <Bar dataKey="sell" fill="var(--danger)" radius={[4,4,0,0]} name="매도" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      );
    }

    case 'dividend': {
      const hist = ((d.dividendHistory as {exDate:string;amount:number}[] | undefined) ?? []).slice(-12);
      const metrics = [
        { label: '배당수익률', value: d.yield?.toFixed(2) ?? '-', unit: '%', desc: '현재가 대비 연간 배당금 비율입니다.', sparkData: hist.map(h => h.amount) },
        { label: '주당배당금(DPS)', value: d.dividendPerShare?.toLocaleString() ?? '-', unit: '원', desc: '주식 1주당 지급되는 배당금입니다.' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.some(m => m.value !== '-') && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>배당 지표</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint="-" hintColor="#94a3b8" onClick={() => c.sparkData && openWindow(c)} />)}
              </div>
            </div>
          )}
          {hist.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>배당금 이력</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="exDate" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`₩${v}`, '배당금']} />
                  <Bar dataKey="amount" fill="#a855f7" radius={[4,4,0,0]} name="배당금" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {openWindows.map(win => (
            <DraggableMetricWindow key={win.id} win={win} onClose={() => closeWindow(win.id)} onFocus={() => focusWindow(win.id)} onMove={(x,y) => updatePos(win.id, x, y)} />
          ))}
        </div>
      );
    }

    case 'derivatives': {
      const chain = (d.optionChain as {strike:number;callIV:number;putIV:number;callOI:number;putOI:number}[] | undefined) ?? [];
      const metrics = [
        { label: '내재변동성(IV)', value: d.impliedVol?.toFixed(2) ?? '-', unit: '%', desc: '옵션 가격에 내재된 예상 변동성입니다.' },
        { label: '만기일', value: d.expiry ? new Date(d.expiry).toLocaleDateString() : '-', unit: '', desc: '옵션 계약이 만료되는 날짜입니다.' },
        { label: '행사가', value: d.strike?.toLocaleString() ?? '-', unit: '', desc: '옵션을 행사할 수 있는 기준 가격입니다.' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.some(m => m.value !== '-') && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>파생상품 지표</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint="-" hintColor="#94a3b8" />)}
              </div>
            </div>
          )}
          {chain.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>옵션 내재 변동성 (IV) by 행사가</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chain}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="strike" tick={{ fill:'var(--text-muted)', fontSize:11 }} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickFormatter={v=>`${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any,n: any) => [`${v}%`, n]} />
                  <Legend wrapperStyle={{ color:'var(--text-secondary)', fontSize:12 }} />
                  <Line type="monotone" dataKey="callIV" stroke="var(--success)" strokeWidth={2} dot={{ r:3 }} name="콜 IV" />
                  <Line type="monotone" dataKey="putIV" stroke="var(--danger)" strokeWidth={2} dot={{ r:3 }} name="풋 IV" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      );
    }

    case 'funds': {
      const navHist = ((d.navHistory as {date:string;nav:number}[] | undefined) ?? []).slice(-90);
      const metrics = [
        { label: '순자산가치(NAV)', value: d.nav?.toLocaleString() ?? '-', unit: '원', desc: '펀드의 1주당 순자산가치입니다.', sparkData: navHist.map(h => h.nav) },
        { label: '총수익률', value: d.totalReturn?.toFixed(2) ?? '-', unit: '%', desc: '설정 이후 또는 특정 기간 동안의 총 수익률입니다.', hint: d.totalReturn ? (d.totalReturn > 0 ? '수익' : '손실') : '-', hintColor: d.totalReturn ? (d.totalReturn > 0 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.some(m => m.value !== '-') && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>펀드 핵심 지표</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint={c.hint ?? "-"} hintColor={c.hintColor ?? "#94a3b8"} onClick={() => c.sparkData && openWindow(c)} />)}
              </div>
            </div>
          )}
          {navHist.length > 0 && (
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
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} tickLine={false} />
                  <YAxis domain={['auto','auto']} tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickFormatter={v=>`₩${v.toLocaleString()}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`₩${v.toLocaleString()}`, 'NAV']} />
                  <Area type="monotone" dataKey="nav" stroke="#0ea5e9" fill="url(#fundGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {openWindows.map(win => (
            <DraggableMetricWindow key={win.id} win={win} onClose={() => closeWindow(win.id)} onFocus={() => focusWindow(win.id)} onMove={(x,y) => updatePos(win.id, x, y)} />
          ))}
        </div>
      );
    }

    case 'reits': {
      const priceHist = ((d.priceHistory as {date:string;price:number}[] | undefined) ?? []).slice(-90);
      const breakdown = (d.propertyBreakdown as {type:string;weight:number}[] | undefined) ?? [];
      const metrics = [
        { label: 'FFO', value: d.ffo?.toFixed(2) ?? '-', unit: '', desc: '운영수익(Funds From Operations)으로 리츠의 실제 현금 창출 능력을 의미합니다.' },
        { label: '배당수익률', value: d.distributionYield?.toFixed(2) ?? '-', unit: '%', desc: '현재 주가 대비 연간 배당 수익률입니다.', sparkData: priceHist.map(h => h.price) },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.some(m => m.value !== '-') && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>리츠 핵심 지표</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                {metrics.filter(c => c.value !== '-').map((c, i) => <MetricCard key={i} {...c} hint="-" hintColor="#94a3b8" onClick={() => c.sparkData && openWindow(c)} />)}
              </div>
            </div>
          )}
          {(priceHist.length > 0 || breakdown.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: priceHist.length > 0 && breakdown.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>
              {priceHist.length > 0 && (
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
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill:'var(--text-muted)', fontSize:11 }} tickLine={false} />
                      <YAxis domain={['auto','auto']} tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="price" stroke="#22c55e" fill="url(#reitGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {breakdown.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>자산 유형 구성</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={breakdown} dataKey="weight" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={(props: any)=>`${props.type} ${props.weight}%`}>
                        {breakdown.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, '비중']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
          {openWindows.map(win => (
            <DraggableMetricWindow key={win.id} win={win} onClose={() => closeWindow(win.id)} onFocus={() => focusWindow(win.id)} onMove={(x,y) => updatePos(win.id, x, y)} />
          ))}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
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
        width: 440, background:'#FFFFFF', border:'1px solid var(--border)',
        borderRadius:16, padding:20, boxShadow:'var(--shadow-card)',
        pointerEvents:'auto'
      }}
      onMouseDown={onFocus}
    >
      <div 
        onMouseDown={onMouseDown}
        style={{ 
          display:'flex', justifyContent:'space-between', alignItems:'flex-start', 
          marginBottom:16, cursor:'move', paddingBottom:10, borderBottom:'1px solid var(--border)' 
        }}
      >
        <div>
          <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)', marginBottom:4 }}>
            {win.label} 추이
            <span style={{ fontSize:14, fontWeight:700, color:win.hintColor !== '#94a3b8' && win.hintColor !== '-' ? win.hintColor : 'var(--text-primary)', marginLeft: 10 }}>
              {win.value}{win.unit}
            </span>
          </h3>
          <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.3, maxWidth:340 }}>{win.desc}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, padding:4 }}
        >✕</button>
      </div>
      
      <div style={{ height: 180, width: '100%', marginTop:10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={win.sparkData.map((val:any, idx:number) => ({ val, period: `M-${idx+1}` }))} margin={{ top:5, right:5, bottom:0, left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="period" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip 
              contentStyle={{ background:'#FFFFFF', border:'1px solid var(--border)', borderRadius:8, fontSize: 11 }}
              formatter={(v: any) => [v.toFixed(2), win.label]}
            />
            <Area 
              type="monotone" dataKey="val" 
              stroke={win.hintColor !== '#94a3b8' && win.hintColor !== '-' ? win.hintColor : 'var(--brand-blue)'} 
              fill={win.hintColor !== '#94a3b8' && win.hintColor !== '-' ? win.hintColor : 'var(--brand-blue)'} 
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
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {block.title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{block.title}</h3>
          {block.description && (
             <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{block.description}</div>
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
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: '#1A1A1A',
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey={yKey} stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={block.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey={yKey} fill="var(--brand-blue)" radius={[4, 4, 0, 0]} />
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
                label={(props: any) => `${props[nameKey]} (${props[valueKey]}%)`}
                labelLine={false}
              >
                {block.data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          ) : (
            <AreaChart data={block.data}>
               <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
               <XAxis dataKey={xKey} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
               <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
               <Tooltip contentStyle={tooltipStyle} />
               <Area type="monotone" dataKey={yKey} stroke="var(--success)" fill="var(--success)" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      );

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={block.data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill:'var(--text-secondary)', fontSize:10 }} />
            <Radar name="Score" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      );

    case 'ranking':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {block.data.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{i+1}</div>
              <div style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      );

    case 'table':
      return <TableView data={block.data} />;

    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
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
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
              {keys.map(k => (
                <th key={k} style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
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
    if (entries.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>표시할 데이터가 없습니다.</div>;
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  return <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>지원하지 않는 데이터 형식입니다.</div>;
}
