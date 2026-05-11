'use client';

import { useState, useEffect } from 'react';
import { type ProcessedData } from '@/lib/types';
import ConfirmModal from './ConfirmModal';
import { FileText, Trash2, GripVertical, Calendar, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['var(--accent)', 'var(--brand-blue)', '#06b6d4', 'var(--warning)', 'var(--danger)', '#f97316', '#22c55e'];

interface UploadedDataDashboardProps {
  items: ProcessedData[];
  onSelectItem: (item: ProcessedData) => void;
  onDeleteItem: (id: string) => void;
}

export default function UploadedDataDashboard({ items, onSelectItem, onDeleteItem }: UploadedDataDashboardProps) {
  const [sortedItems, setSortedItems] = useState<ProcessedData[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    // When items change (e.g. initial load or delete), we sync with local state.
    // Ideally we would load the custom sort order from localStorage here.
    const savedOrderStr = localStorage.getItem('uploadedDataOrder');
    let savedOrder: string[] = [];
    if (savedOrderStr) {
      try {
        savedOrder = JSON.parse(savedOrderStr);
      } catch {}
    }

    const newSorted = [...items].sort((a, b) => {
      const idxA = savedOrder.indexOf(a.id);
      const idxB = savedOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return new Date(b.metadata.processedAt).getTime() - new Date(a.metadata.processedAt).getTime();
    });

    setSortedItems(newSorted);
  }, [items]);

  const saveOrder = (newItems: ProcessedData[]) => {
    setSortedItems(newItems);
    localStorage.setItem('uploadedDataOrder', JSON.stringify(newItems.map(i => i.id)));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newItems = [...sortedItems];
    const draggedIdx = newItems.findIndex(i => i.id === draggedId);
    const targetIdx = newItems.findIndex(i => i.id === targetId);

    const [draggedItem] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedItem);
    saveOrder(newItems);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center p-10">
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <FileText size={32} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>업로드한 데이터가 없습니다</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: 400 }}>
          왼쪽 메뉴의 &apos;데이터 불러오기&apos;를 통해 파일을 업로드하시면 AI가 분석한 대시보드를 여기에 보관합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }} className="gradient-text">내가 올린 데이터</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>업로드하신 데이터와 AI 분석 결과를 한눈에 관리하세요. 드래그하여 순서를 변경할 수 있습니다.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {sortedItems.map(item => {
          const isDragging = draggedId === item.id;
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
                          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} cursor={{ fill: 'rgba(0,208,124,0.05)' }} />
                          <Bar dataKey={yKey} fill="var(--brand-blue)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      ) : cType === 'pie' ? (
                        <PieChart>
                          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                          <Pie data={chartBlock.data} dataKey={vKey} cx="50%" cy="50%" outerRadius={chartBlocks.length === 1 ? 70 : 50} innerRadius={chartBlocks.length === 1 ? 40 : 25} isAnimationActive={false} stroke="none">
                            {chartBlock.data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      ) : (
                        <LineChart data={chartBlock.data}>
                          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                          <Line type="monotone" dataKey={yKey} stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
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
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                      <Area type="monotone" dataKey="val" stroke="var(--brand-blue)" fill="var(--brand-blue)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
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
                  <div key="table" style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                          {keys.map(k => <th key={k} style={{ padding: '6px', textAlign: 'left', fontWeight: 600 }}>{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            {keys.map(k => <td key={k} style={{ padding: '6px' }}>{String(r[k]).substring(0, 15)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ];
              }
            }
          } else if ('priceHistory' in item.data) {
               const hist = item.data.priceHistory as any[];
               if (Array.isArray(hist) && hist.length > 0) {
                 const dataKeys = Object.keys(hist[0]);
                 let yKey = 'price';
                 if (!dataKeys.includes('price')) {
                   if (dataKeys.includes('close')) yKey = 'close';
                   else if (dataKeys.includes('value')) yKey = 'value';
                   else yKey = dataKeys.find(k => typeof hist[0][k] === 'number') || dataKeys[dataKeys.length > 1 ? 1 : 0];
                 }

                 thumbnailViews = [
                    <div key="hist" style={{ height: 140, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hist}>
                          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
                          <Line type="monotone" dataKey={yKey} stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
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
                          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px', zIndex: 100 }} />
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

          return (
            <div 
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              style={{ 
                background: '#FFFFFF', 
                border: '1px solid var(--border)', 
                borderRadius: '16px',
                boxShadow: 'var(--shadow-card)',
                display: 'grid',
                gridTemplateRows: '190px 202px',
                overflow: 'hidden',
                opacity: isDragging ? 0.4 : 1,
                cursor: 'grab',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                height: '392px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              {/* THUMBNAIL AREA (YouTube style hero image) */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(0,208,124,0.10), rgba(0,122,255,0.08))', 
                  padding: '30px 20px 20px', 
                  display: 'flex', 
                  gap: '12px',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                  height: '190px',
                  minHeight: 0,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => onSelectItem(item)}
              >
                {thumbnailViews.length > 0 ? (
                  <div style={{ display: 'flex', gap: '12px', width: '100%', height: '100%', alignItems: 'center', pointerEvents: 'none' }}>
                    {thumbnailViews}
                  </div>
                ) : (
                  <div style={{ margin: 'auto', color: 'var(--text-muted)' }}><FileText size={48} /></div>
                )}
                
                {/* Floating Badges */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '8px' }}>
                  <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab' }} onMouseDown={(e) => e.stopPropagation()} />
                  <div style={{ 
                    padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                    background: 'var(--brand-green-soft)', color: 'var(--brand-green-dark)', backdropFilter: 'blur(4px)'
                  }}>
                    {item.categoryKo}
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id); }}
                  style={{ position: 'absolute', top: 12, right: 12, background: '#FFFFFF', borderRadius: '50%', border: '1px solid var(--border)', color: 'var(--danger)', cursor: 'pointer', padding: '6px', backdropFilter: 'blur(4px)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-red-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* CONTENT AREA */}
              <div
                style={{
                  padding: '20px',
                  display: 'grid',
                  gridTemplateRows: '48px 72px 18px',
                  rowGap: '12px',
                  height: '202px',
                  minHeight: 0,
                }}
              >
                <div style={{ cursor: 'pointer', minHeight: 0 }} onClick={() => onSelectItem(item)}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </h3>
                </div>

                <div style={{ cursor: 'pointer', minHeight: 0 }} onClick={() => onSelectItem(item)}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.summary}
                  </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    <Calendar size={12} />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal (Portal) */}
      {deleteConfirmId && (() => {
        const targetItem = sortedItems.find(item => item.id === deleteConfirmId);
        return (
          <ConfirmModal
            icon={<AlertTriangle size={21} />}
            title="데이터를 삭제할까요?"
            description="삭제 후에는 이 분석 결과를 다시 복구할 수 없습니다."
            confirmLabel="삭제"
            onCancel={() => setDeleteConfirmId(null)}
            onConfirm={() => { onDeleteItem(deleteConfirmId); setDeleteConfirmId(null); }}
          >
            {targetItem && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 14px',
              }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px' }}>
                  {targetItem.title}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{targetItem.categoryKo}</p>
              </div>
            )}
          </ConfirmModal>
        );
      })()}
    </div>
  );
}
