'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, FileJson, FileText, Database, TrendingUp, Search, Zap, Layers, PieChart, BarChart2, Activity } from 'lucide-react';

interface UploadPanelProps {
  onProcess: (file: File | null, dummyKey?: string) => Promise<void>;
  processing: boolean;
  processingName: string;
  error: string | null;
  // onClose is kept in props just in case it's used elsewhere, but we won't render the X button.
  onClose: () => void;
}

export default function UploadPanel({ onProcess, processing, processingName, error }: UploadPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setSelectedFile(f);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)' }}>
      <div className="animate-fade-up w-full max-w-6xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '60px', alignItems: 'center' }}>
      
      {/* ── Left Column: Info & Examples ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }} className="gradient-text">
            투자 데이터를<br/>AI가 분석해 드립니다
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            증권사 거래내역, 포트폴리오, 관심종목 리스트 등 가지고 계신 Raw 데이터를 업로드하세요. 
            생성형 AI가 데이터를 분석하고 인사이트를 도출합니다.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>이런 데이터를 올릴 수 있어요</h3>
          
          <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Layers size={18} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>나만의 포트폴리오</h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>보유 중인 주식, ETF 비중을 담은 CSV 파일을 올리면 섹터별 리스크와 기대 수익률을 분석합니다.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={18} style={{ color: '#34d399' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>거래 내역 로그</h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>과거 매수/매도 기록을 업로드하면 투자 패턴을 시각화하고 승률 개선 포인트를 짚어드립니다.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Search size={18} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>관심 종목 묶음</h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>지켜보고 있는 관심 종목들의 티커 리스트를 올리면 실시간 뉴스와 모멘텀을 요약해 보여줍니다.</p>
            </div>
          </div>
        </div>

        {/* ── Visualizations Example ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>이런 시각화가 제공됩니다</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <PieChart size={20} style={{ color: '#ec4899' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>자산 비중 도넛 차트</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>다각화 수준 분석</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <BarChart2 size={20} style={{ color: '#0ea5e9' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>월별 수익률 바 차트</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>기간별 성과 추적</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Activity size={20} style={{ color: '#8b5cf6' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>가격 모멘텀 라인 차트</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>기술적 지표 및 추세</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Zap size={20} style={{ color: '#eab308' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>AI 투자 인사이트</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>자연어 리스크 진단</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Right Column: Upload Card ── */}
      <div style={{
        background: 'rgba(20, 27, 45, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '40px',
        display: 'flex', flexDirection: 'column', gap: '24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={20} style={{ color: '#6366f1' }} />
          <h3 style={{ fontWeight: 700, fontSize: '17px' }}>파일 업로드</h3>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
            background: dragOver ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            padding: '50px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            flex: 1, minHeight: '340px',
          }}
          onMouseEnter={e => {
            if (!dragOver) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }
          }}
          onMouseLeave={e => {
            if (!dragOver) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            }
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv,.txt"
            className="hidden"
            onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
          />
          
          {selectedFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: 'rgba(99,102,241,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {selectedFile.name.endsWith('.json') 
                  ? <FileJson size={32} style={{ color: '#818cf8' }} /> 
                  : <FileText size={32} style={{ color: '#818cf8' }} />
                }
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {selectedFile.name}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Upload size={32} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                  클릭하거나 파일을 드래그하세요
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  지원 포맷: JSON, CSV, TXT (최대 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {selectedFile && (
          <button
            onClick={() => !processing && onProcess(selectedFile)}
            disabled={processing}
            style={{
              marginTop: '8px',
              width: '100%', padding: '16px', borderRadius: '14px',
              border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white', fontSize: '15px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: processing ? 0.6 : 1,
              transition: 'all 0.2s',
              boxShadow: processing ? 'none' : '0 8px 24px rgba(99,102,241,0.25)',
            }}
            onMouseEnter={e => { if (!processing) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { if (!processing) e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {processing ? (
              <><Loader2 size={18} className="animate-spin" /> {processingName} 분석 중…</>
            ) : (
              <><Zap size={18} /> AI 분석 시작하기</>
            )}
          </button>
        )}

        {error && (
          <div className="animate-fade-up" style={{
            marginTop: '8px',
            padding: '16px 20px', borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '12px' }}>⚠️</span>
            </div>
            <span style={{ fontSize: '14px', color: '#fca5a5', lineHeight: 1.5 }}>
              {error}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
