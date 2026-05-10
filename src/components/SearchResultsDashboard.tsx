'use client';

import { useState, useEffect } from 'react';
import { type ProcessedData } from '@/lib/types';
import { FileText, Trash2, GripVertical, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

interface SearchResultsDashboardProps {
  items: ProcessedData[];
  onSelectItem: (item: ProcessedData) => void;
  query: string;
}

export default function SearchResultsDashboard({ items, onSelectItem, query }: SearchResultsDashboardProps) {
  const sortedItems = items; // Or any default sorting you want for search results

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center p-10">
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <FileText size={32} style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>검색 결과가 없습니다</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: 400 }}>
          '{query}' 검색어에 대한 데이터가 존재하지 않습니다. 다른 검색어로 시도해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }} className="gradient-text">검색 결과</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>'{query}'에 대한 분석 결과를 확인하세요.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {sortedItems.map(item => {
          const dateStr = new Date(item.metadata.processedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          
          // Try to find sparkline data if it's a block with metrics
          let sparkData: number[] = [];
          if (typeof item.data === 'object' && item.data !== null && 'blocks' in item.data) {
            const blocks = item.data.blocks as any[];
            const metricBlock = blocks.find(b => b.type === 'metrics' && b.data && b.data.length > 0 && b.data[0].sparkData);
            if (metricBlock) {
              sparkData = metricBlock.data[0].sparkData;
            }
          }

          // Determine thumbnail visualization (YouTube style)
          let thumbnailViews: React.ReactNode[] = [];
          if (typeof item.data === 'object' && item.data !== null) {
            if ('blocks' in item.data) {
              const blocks = item.data.blocks as any[];
              const chartBlocks = blocks.filter(b => b.type === 'chart').slice(0, 2);
            
            if (chartBlocks.length > 0) {
              thumbnailViews = chartBlocks.map((chartBlock, idx) => {
                const cType = chartBlock.config?.chartType || 'line';
                let xKey = chartBlock.config?.xAxisKey || 'date';
                let yKey = chartBlock.config?.yAxisKey || 'value';
                let vKey = chartBlock.config?.valueKey || 'value';

                if (chartBlock.data && chartBlock.data.length > 0) {
                  const dataKeys = Object.keys(chartBlock.data[0]);
                  if (!dataKeys.includes(xKey)) {
                    xKey = dataKeys.find(k => typeof chartBlock.data[0][k] === 'string') || dataKeys[0];
                  }
                  if (!dataKeys.includes(yKey)) {
                    yKey = dataKeys.find(k => typeof chartBlock.data[0][k] === 'number') || dataKeys[dataKeys.length > 1 ? 1 : 0];
                  }
                  if (!dataKeys.includes(vKey)) {
                    vKey = yKey;
                  }
                }
                return (
                  <div key={idx} style={{ flex: 1, minWidth: 0, height: chartBlocks.length === 1 ? 160 : 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {cType === 'bar' ? (
                        <BarChart data={chartBlock.data}>
                          <Tooltip contentStyle={{ background: 'rgba(10,14,26,0.9)', border: 'none', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Bar dataKey={yKey} fill="#8b5cf6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      ) : cType === 'pie' ? (
                        <PieChart>
                          <Tooltip contentStyle={{ background: 'rgba(10,14,26,0.9)', border: 'none', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                          <Pie data={chartBlock.data} dataKey={vKey} cx="50%" cy="50%" outerRadius={chartBlocks.length === 1 ? 70 : 50} innerRadius={chartBlocks.length === 1 ? 40 : 25} isAnimationActive={false} stroke="none">
                            {chartBlock.data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      ) : (
                        <LineChart data={chartBlock.data}>
                          <Tooltip contentStyle={{ background: 'rgba(10,14,26,0.9)', border: 'none', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                          <Line type="monotone" dataKey={yKey} stroke="#6366f1" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                );
              });
            } else if (sparkData.length > 0) {
              thumbnailViews = [
                <div key="spark" style={{ height: 140, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData.map((val, i) => ({ val, i }))}>
                      <Tooltip contentStyle={{ background: 'rgba(10,14,26,0.9)', border: 'none', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                      <Area type="monotone" dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ];
            } else {
              // Table fallback
              const tableBlock = blocks.find(b => b.type === 'table');
              if (tableBlock && tableBlock.data && Array.isArray(tableBlock.data)) {
                const keys = Object.keys(tableBlock.data[0] || {}).slice(0, 4);
                const rows = tableBlock.data.slice(0, 4);
                thumbnailViews = [
                  <div key="table" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {keys.map(k => <th key={k} style={{ padding: '6px', textAlign: 'left', fontWeight: 600 }}>{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            {keys.map(k => <td key={k} style={{ padding: '6px' }}>{String(r[k]).substring(0, 15)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ];
              }
            }
          } else {
             const histKey = ['priceHistory', 'history', 'yieldHistory', 'navHistory', 'dividendHistory'].find(k => k in item.data);
             if (histKey) {
               const hist = item.data[histKey] as any[];
               if (Array.isArray(hist) && hist.length > 0) {
                 const dataKeys = Object.keys(hist[0]);
                 let yKey = 'price';
                 if (!dataKeys.includes('price')) {
                   if (dataKeys.includes('close')) yKey = 'close';
                   else if (dataKeys.includes('value')) yKey = 'value';
                   else if (dataKeys.includes('amount')) yKey = 'amount';
                   else if (dataKeys.includes('yield')) yKey = 'yield';
                   else if (dataKeys.includes('rate')) yKey = 'rate';
                   else yKey = dataKeys.find(k => typeof hist[0][k] === 'number') || dataKeys[dataKeys.length > 1 ? 1 : 0];
                 }

                 thumbnailViews = [
                    <div key="hist" style={{ height: 140, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hist}>
                          <Tooltip contentStyle={{ background: 'rgba(10,14,26,0.9)', border: 'none', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                          <Line type="monotone" dataKey={yKey} stroke="#6366f1" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                 ];
               }
            } else if ('optionChain' in item.data) {
               const chain = item.data.optionChain as any[];
               if (Array.isArray(chain) && chain.length > 0) {
                 thumbnailViews = [
                    <div key="scatter" style={{ height: 140, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chain}>
                          <Line type="monotone" dataKey="callIV" stroke="#10b981" dot={false} strokeWidth={2} isAnimationActive={false} />
                          <Line type="monotone" dataKey="putIV" stroke="#ef4444" dot={false} strokeWidth={2} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                 ];
               }
            } else if ('holdings' in item.data) {
               const holds = item.data.holdings as any[];
               if (Array.isArray(holds) && holds.length > 0) {
                  thumbnailViews = [
                     <div key="pie" style={{ height: 140, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip contentStyle={{ background: 'rgba(10,14,26,0.9)', border: 'none', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                          <Pie data={holds} dataKey="weight" cx="50%" cy="50%" outerRadius={60} innerRadius={35} isAnimationActive={false} stroke="none">
                            {holds.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                     </div>
                  ];
               }
            }
          }
        }

        return (
            <div 
              key={item.id}
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '20px',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* THUMBNAIL AREA (YouTube style hero image) */}
              <div 
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(30,41,59,0.5), rgba(15,23,42,0.8))', 
                  padding: '30px 20px 20px', 
                  display: 'flex', 
                  gap: '12px',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  minHeight: '180px',
                  position: 'relative'
                }}
                onClick={() => onSelectItem(item)}
              >
                {thumbnailViews.length > 0 ? thumbnailViews : (
                  <div style={{ margin: 'auto', color: 'rgba(255,255,255,0.1)' }}><FileText size={48} /></div>
                )}
                
                {/* Floating Badges */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                    background: 'rgba(99,102,241,0.2)', color: '#818cf8', backdropFilter: 'blur(4px)'
                  }}>
                    {item.categoryKo}
                  </div>
                </div>
              </div>

              {/* CONTENT AREA */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => onSelectItem(item)}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.summary}
                  </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                    <Calendar size={12} />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
