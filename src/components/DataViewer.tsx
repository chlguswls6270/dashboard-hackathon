'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORY_META, type ProcessedData } from '@/lib/types';
import { CAT_ICONS } from '@/lib/icons';
import InsightsPanel from './InsightsPanel';
import ChartPanel from './charts/ChartPanel';
import StatsRow from './StatsRow';
import { ArrowLeft, ChevronRight, Star, Table, Send, Loader2, ChevronDown, ChevronUp, CheckCircle2, Sparkles, Settings, LayoutDashboard, X, Wrench, ChevronLeft } from 'lucide-react';

interface DataViewerProps {
  data: ProcessedData;
  isFavorite?: boolean;
  onBack?: () => void;
  onToggleFavorite?: () => void;
  onUpdate?: (updatedData: ProcessedData) => void;
  onRequestReanalyze?: (currentData: ProcessedData, prompt: string) => void;
  isReanalyzing?: boolean;
}

export default function DataViewer({ data, isFavorite, onBack, onToggleFavorite, onUpdate, onRequestReanalyze, isReanalyzing }: DataViewerProps) {
  const [prompt, setPrompt] = useState('');
  const [isToolboxOpen, setToolboxOpen] = useState(false);
  const [toolboxView, setToolboxView] = useState<'menu' | 'prompt' | 'raw'>('menu');
  const [isEditMode, setIsEditMode] = useState(false);

  const toolboxRef = React.useRef<HTMLDivElement>(null);
  const toolboxButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolboxRef.current && !toolboxRef.current.contains(event.target as Node) &&
          toolboxButtonRef.current && !toolboxButtonRef.current.contains(event.target as Node)) {
        setToolboxOpen(false);
        setTimeout(() => setToolboxView('menu'), 300);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isUserUploaded = (data.data as any)?.isUserUploaded;

  const omittedDataObj = (data as any).omittedData || (data.data as any)?.omittedData;
  const omittedEntries = omittedDataObj 
    ? Object.entries(omittedDataObj).filter(([k, v]) => k !== 'isUserUploaded' && typeof v !== 'object' && v !== null && v !== undefined && String(v).trim() !== '')
    : [];

  const handleReanalyze = () => {
    if (!(prompt || '').trim() || !onRequestReanalyze || isReanalyzing) return;
    onRequestReanalyze(data, prompt || '');
    setPrompt('');
    setToolboxOpen(false);
    setTimeout(() => setToolboxView('menu'), 300);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Page title */}
      <div className="flex justify-between items-start gap-6" style={{ marginBottom: '10px' }}>
        <div style={{ minWidth: 0 }}>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg transition-colors"
              style={{
                background: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                padding: '4px 0',
                marginBottom: '6px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <ArrowLeft size={16} />
              돌아가기
            </button>
          )}
          <div className="flex items-center gap-1.5 mb-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <button onClick={onBack} style={{ color: 'var(--text-secondary)' }}>
              {isUserUploaded ? '내가 올린 데이터' : (data.categoryKo || CATEGORY_META[data.category]?.ko || '시장 데이터')}
            </button>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--accent)' }}>{data.title}</span>
          </div>
          {/* Title row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800, lineHeight: 1.25, margin: 0 }}>
              {data.title}
            </h1>
          </div>
        </div>



        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: isFavorite ? '#F59E0B' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600,
                transition: 'all 0.2s',
                padding: '8px 12px', borderRadius: '8px',
              }}
              onMouseEnter={e => { if (!isFavorite) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { if (!isFavorite) e.currentTarget.style.background = 'transparent'; }}
            >
              <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            </button>
          )}

          {isUserUploaded && (
            <>
              <button
                ref={toolboxButtonRef}
                onClick={() => {
                  if (isToolboxOpen) {
                    setToolboxOpen(false);
                    setTimeout(() => setToolboxView('menu'), 300);
                  } else {
                    setToolboxOpen(true);
                  }
                }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isToolboxOpen ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                  color: isToolboxOpen ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isToolboxOpen ? '0 4px 12px rgba(0,122,255,0.3)' : 'none'
                }}
              >
                <Wrench size={16} />
              </button>
              
              <div 
                ref={toolboxRef}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--border)', zIndex: 100,
                  display: 'flex', flexDirection: 'column', 
                  transformOrigin: 'top right',
                  transform: isToolboxOpen ? 'scale(1)' : 'scale(0.95)',
                  opacity: isToolboxOpen ? 1 : 0,
                  pointerEvents: isToolboxOpen ? 'auto' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: toolboxView === 'menu' ? '200px' : toolboxView === 'prompt' ? '360px' : '480px',
                  maxHeight: '70vh', overflowY: 'auto'
                }}
              >
                {toolboxView === 'menu' && (
                  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={() => setToolboxView('prompt')}
                      style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Sparkles size={16} color="var(--brand-blue)" /> 추가 분석 요청
                    </button>
                    <button
                      onClick={() => setToolboxView('raw')}
                      style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Table size={16} color="var(--accent)" /> 누락 데이터 확인
                    </button>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                    <button
                      onClick={() => { setIsEditMode(!isEditMode); setToolboxOpen(false); }}
                      style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: 'none', background: isEditMode ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: isEditMode ? 'var(--brand-blue)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <LayoutDashboard size={16} /> {isEditMode ? '편집 모드 끄기' : '대시보드 편집'}
                    </button>
                  </div>
                )}

                {toolboxView === 'prompt' && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                      <button onClick={() => setToolboxView('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}><ChevronLeft size={20} /></button>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>추가 분석 요청</h3>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>원하는 분석 방향을 텍스트로 입력하시면 AI가 맞춤형 차트를 다시 생성해 드립니다.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <textarea 
                        value={prompt}
                        onChange={e => {
                          setPrompt(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder="예: 막대그래프로 보여줘"
                        style={{ 
                          width: '100%', padding: '10px 14px', borderRadius: '10px', 
                          border: '1px solid var(--border)', fontSize: '13px', outline: 'none',
                          resize: 'none', overflow: 'hidden', minHeight: '40px', lineHeight: '1.5'
                        }}
                        onKeyDown={e => { 
                          if (e.key === 'Enter' && !e.shiftKey) { 
                            e.preventDefault();
                            handleReanalyze(); 
                          } 
                        }}
                        autoFocus
                        rows={1}
                      />
                      <button 
                        onClick={handleReanalyze}
                        disabled={isReanalyzing || !(prompt || '').trim()}
                        style={{
                          background: isReanalyzing || !(prompt || '').trim() ? '#e5e7eb' : 'var(--brand-blue)',
                          color: isReanalyzing || !(prompt || '').trim() ? 'var(--text-muted)' : '#fff',
                          border: 'none', borderRadius: '10px', padding: '10px 16px',
                          fontSize: '13px', fontWeight: 600, cursor: isReanalyzing || !(prompt || '').trim() ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                      >
                        {isReanalyzing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {isReanalyzing ? '분석 중...' : '다시 분석하기'}
                      </button>
                    </div>
                  </div>
                )}

                {toolboxView === 'raw' && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                      <button onClick={() => setToolboxView('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}><ChevronLeft size={20} /></button>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>누락 데이터 확인</h3>
                    </div>
                    {omittedEntries.length > 0 ? (
                      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                              <th style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>필드명</th>
                              <th style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>데이터 값</th>
                            </tr>
                          </thead>
                          <tbody>
                            {omittedEntries.map(([k, v], idx) => (
                              <tr key={k} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500, borderRight: '1px solid var(--border)' }}>{k}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{String(v)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>누락된 원본 데이터가 없습니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <StatsRow data={data} />

      {/* Main chart */}
      <div className="glass" style={{ minHeight: 420, padding: '32px' }}>
        <ChartPanel data={data} onUpdate={onUpdate} isEditMode={isEditMode} />
      </div>

      {/* Insights */}
      <InsightsPanel insights={data.insights} riskLevel={data.riskLevel} />

    </div>
  );
}
