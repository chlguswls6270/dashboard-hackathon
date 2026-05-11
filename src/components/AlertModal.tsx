'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type ProcessedData, type AlertItem } from '@/lib/types';
import { BellRing, X } from 'lucide-react';

interface AlertModalProps {
  cachedData: ProcessedData[];
  onClose: () => void;
  onSave: (alert: Omit<AlertItem, 'id' | 'createdAt'>) => void;
}

export default function AlertModal({ cachedData, onClose, onSave }: AlertModalProps) {
  const [name, setName] = useState('');
  const [targetItemId, setTargetItemId] = useState(cachedData[0]?.id || '');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState<string>('');

  // Selected item to show its current price as a hint
  const selectedItem = cachedData.find(d => d.id === targetItemId);
  let currentValStr = '';
  if (selectedItem) {
    const v = (selectedItem.data as any).currentPrice || (selectedItem.data as any).currentValue || (selectedItem.data as any).nav || (selectedItem.data as any).currentRate || (selectedItem.data as any).currentYield;
    if (v !== undefined) {
      currentValStr = `(현재가: ${v.toLocaleString()})`;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetItemId || !targetPrice) return;

    onSave({
      name: name.trim(),
      targetItemId,
      condition,
      targetPrice: parseFloat(targetPrice),
      active: true
    });
  };

  // Block body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const modal = (
    <>
      {/* Full-screen dark overlay — blocks ALL interaction beneath */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0, 0, 0, 0.35)',
        }}
      />

      {/* Modal card — always viewport-centered via portal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '28px',
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 24px 70px rgba(26, 26, 26, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          animation: 'confirmSlideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <style>{`
          @keyframes confirmSlideUp {
            from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)) scale(0.97); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '12px',
            background: 'var(--brand-blue-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand-blue)', flexShrink: 0,
          }}>
            <BellRing size={21} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              새 알림 추가
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              특정 가격에 도달하면 알림을 보내드려요.
            </p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>알림 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 삼성전자 익절 타이밍"
              style={{
                width: '100%', borderRadius: '10px', padding: '10px 14px', fontSize: '14px',
                border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--brand-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>대상 종목</label>
            <select
              value={targetItemId}
              onChange={(e) => setTargetItemId(e.target.value)}
              style={{
                width: '100%', borderRadius: '10px', padding: '10px 14px', fontSize: '14px',
                border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                outline: 'none', transition: 'border-color 0.2s', appearance: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--brand-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              required
            >
              {cachedData.map(d => (
                <option key={d.id} value={d.id}>
                  [{d.categoryKo}] {d.title} {(d.data as any).ticker ? `(${(d.data as any).ticker})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              목표 가격
              <span style={{ fontSize: '11px', color: 'var(--brand-blue)' }}>{currentValStr}</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="가격 입력"
                style={{
                  flex: 1, borderRadius: '10px', padding: '10px 14px', fontSize: '14px',
                  border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  outline: 'none', transition: 'border-color 0.2s', minWidth: 0
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                required
              />
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                style={{
                  width: '110px', borderRadius: '10px', padding: '10px 12px', fontSize: '13px',
                  border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  outline: 'none', transition: 'border-color 0.2s', appearance: 'none', textAlign: 'center'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="above">이상 도달 시</option>
                <option value="below">이하 도달 시</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !targetItemId || !targetPrice}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--brand-blue)', border: '1px solid rgba(0, 122, 255, 0.25)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 8px 20px rgba(0, 122, 255, 0.2)',
                opacity: (!name.trim() || !targetItemId || !targetPrice) ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if ((!name.trim() || !targetItemId || !targetPrice)) return;
                e.currentTarget.style.background = '#0066CC'; e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                if ((!name.trim() || !targetItemId || !targetPrice)) return;
                e.currentTarget.style.background = 'var(--brand-blue)'; e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              알림 생성
            </button>
          </div>
        </form>
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}

