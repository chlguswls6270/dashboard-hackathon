'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, FileJson, FileText, Database, TrendingUp, Search, Zap, Layers, PieChart, BarChart2, Activity, Type, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadPanelProps {
  onProcess: (file: File | null, dummyKey?: string) => Promise<void>;
  processing: boolean;
  processingName: string;
  error: string | null;
  onClose: () => void;
}

export default function UploadPanel({ onProcess, processing, processingName, error, onClose }: UploadPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleProcessClick = () => {
    if (processing) return;
    if (inputType === 'file' && selectedFile) {
      setSubmitted(true);
      onProcess(selectedFile);
    } else if (inputType === 'text' && textInput.trim().length > 0) {
      const textFile = new File([textInput], "pasted_data.txt", { type: "text/plain" });
      setSubmitted(true);
      onProcess(textFile);
    }
  };

  const isReady = (inputType === 'file' && selectedFile !== null) || (inputType === 'text' && textInput.trim().length > 0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setSelectedFile(f);
      setSubmitted(false);
    }
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="animate-fade-up w-full" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(460px, 1fr)', gap: '48px', alignItems: 'stretch', width: '100%' }}>
      
      {/* ── Left Column: Info & Examples ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.25 }} className="gradient-text">
            투자 데이터를<br/>AI가 분석해 드립니다
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            증권사 거래내역, 포트폴리오, 관심종목 리스트 등 가지고 계신 Raw 데이터를 업로드하세요. 
            생성형 AI가 데이터를 분석하고 인사이트를 도출합니다.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>이런 데이터를 올릴 수 있어요</h3>
          
          <div style={{ display: 'flex', gap: '16px', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '18px 20px', borderRadius: '14px', boxShadow: 'var(--shadow-card)', minHeight: '92px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,208,124,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Layers size={18} style={{ color: 'var(--brand-green-dark)' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>나만의 포트폴리오</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>보유 중인 주식, ETF 비중을 담은 CSV 파일을 올리면 섹터별 리스크와 기대 수익률을 분석합니다.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '18px 20px', borderRadius: '14px', boxShadow: 'var(--shadow-card)', minHeight: '92px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={18} style={{ color: '#34d399' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>거래 내역 로그</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>과거 매수/매도 기록을 업로드하면 투자 패턴을 시각화하고 승률 개선 포인트를 짚어드립니다.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '18px 20px', borderRadius: '14px', boxShadow: 'var(--shadow-card)', minHeight: '92px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Search size={18} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>관심 종목 묶음</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>지켜보고 있는 관심 종목들의 티커 리스트를 올리면 실시간 뉴스와 모멘텀을 요약해 보여줍니다.</p>
            </div>
          </div>
        </div>

        {/* ── Visualizations Example ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>이런 시각화가 제공됩니다</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface-raised)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', minHeight: '92px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PieChart size={18} style={{ color: 'var(--brand-blue)' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>자산 비중 도넛 차트</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>다각화 수준 분석</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface-raised)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', minHeight: '92px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BarChart2 size={18} style={{ color: 'var(--brand-blue)' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>월별 수익률 바 차트</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>기간별 성과 추적</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface-raised)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', minHeight: '92px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Activity size={18} style={{ color: 'var(--brand-blue)' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>가격 모멘텀 라인 차트</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>기술적 지표 및 추세</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface-raised)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', minHeight: '92px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={18} style={{ color: '#eab308' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>AI 투자 인사이트</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>자연어 리스크 진단</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Right Column: Upload Card ── */}
      <div style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '40px',
        display: 'flex', flexDirection: 'column', gap: '24px',
        boxShadow: 'var(--shadow-card)',
        height: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '-8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontWeight: 700, fontSize: '17px' }}>데이터 입력</h3>
          </div>
          
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => { setInputType('file'); setSubmitted(false); }}
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: inputType === 'file' ? 'var(--brand-green-soft)' : 'transparent', color: inputType === 'file' ? 'var(--brand-green-dark)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            >
              <Upload size={14} /> 파일 업로드
            </button>
            <button 
              onClick={() => { setInputType('text'); setSubmitted(false); }}
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: inputType === 'text' ? 'var(--brand-green-soft)' : 'transparent', color: inputType === 'text' ? 'var(--brand-green-dark)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            >
              <Type size={14} /> 텍스트 입력
            </button>
          </div>
        </div>

        {!processing && error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255,77,77,0.24)',
            background: 'var(--brand-red-soft)',
          }}>
            <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {error}
            </p>
          </div>
        )}

        {/* Input Area */}
        {processing ? (
          <div
            style={{
              border: '1px solid rgba(0,122,255,0.22)',
              background: 'linear-gradient(135deg, rgba(0,122,255,0.08), rgba(0,208,124,0.08))',
              borderRadius: '16px',
              padding: '50px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              flex: 1,
              minHeight: '520px',
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-blue)',
              boxShadow: 'var(--shadow-card)',
              marginBottom: '20px',
            }}>
              <Loader2 size={32} className="animate-spin" />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              분석이 진행 중입니다
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: '360px' }}>
              {`${processingName} 분석을 진행하고 있습니다.`}
            </p>
            <div style={{ width: '220px', height: '4px', borderRadius: '999px', overflow: 'hidden', background: '#FFFFFF', marginTop: '24px' }}>
              <div style={{ width: '42%', height: '100%', borderRadius: '999px', background: 'var(--brand-blue)', animation: 'progress-slide 1.2s ease-in-out infinite' }} />
            </div>
          </div>
        ) : inputType === 'file' ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-light)'}`,
              background: dragOver ? 'var(--brand-green-soft)' : 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '50px 40px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
              flex: 1, minHeight: '520px',
            }}
            onMouseEnter={e => {
              if (!dragOver) {
                e.currentTarget.style.borderColor = 'rgba(0,208,124,0.35)';
                e.currentTarget.style.background = 'var(--bg-card-hover)';
              }
            }}
            onMouseLeave={e => {
              if (!dragOver) {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv,.tsv,.txt"
              className="hidden"
              onChange={e => {
                setSelectedFile(e.target.files?.[0] ?? null);
                setSubmitted(false);
              }}
            />
            
            {selectedFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'rgba(0,208,124,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {selectedFile.name.endsWith('.json') 
                    ? <FileJson size={32} style={{ color: 'var(--brand-green-dark)' }} /> 
                    : <FileText size={32} style={{ color: 'var(--brand-green-dark)' }} />
                  }
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    클릭하거나 파일을 드래그하세요
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    지원 포맷: JSON, CSV, TSV, TXT (최대 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '520px' }}>
            <textarea
              value={textInput}
              onChange={e => {
                setTextInput(e.target.value);
                setSubmitted(false);
              }}
              placeholder="분석할 텍스트나 표, Raw 데이터를 여기에 직접 붙여넣으세요..."
              style={{
                flex: 1,
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        )}

        {/* Action Button */}
        {isReady && !submitted && !processing && (
          <button
            onClick={handleProcessClick}
            disabled={processing}
            style={{
              marginTop: '8px',
              width: '100%', padding: '16px', borderRadius: '14px',
              border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--brand-blue) 100%)',
              color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: processing ? 0.6 : 1,
              transition: 'all 0.2s',
              boxShadow: processing ? 'none' : '0 8px 24px rgba(0,208,124,0.2)',
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
            <span style={{ fontSize: '14px', color: 'var(--danger)', lineHeight: 1.5 }}>
              {error}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
