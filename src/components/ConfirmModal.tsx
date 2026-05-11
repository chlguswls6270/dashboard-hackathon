'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  confirmDanger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children?: React.ReactNode; // optional extra content (e.g. item preview)
}

export default function ConfirmModal({
  icon, title, description,
  cancelLabel = '취소', confirmLabel,
  confirmDanger = true,
  onCancel, onConfirm,
  children,
}: ConfirmModalProps) {
  // Block body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const modal = (
    <>
      {/* Full-screen dark overlay — blocks ALL interaction beneath */}
      <div
        onClick={onCancel}
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
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '12px',
            background: confirmDanger ? '#FFF5F5' : '#F0FDF4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: confirmDanger ? 'var(--danger)' : 'var(--accent)',
            flexShrink: 0,
          }}>
            {icon}
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {description}
            </p>
          </div>
        </div>

        {/* Optional extra content */}
        {children}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              background: '#FFFFFF', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontWeight: 700,
              cursor: 'pointer', fontSize: '14px', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              background: confirmDanger ? 'var(--danger)' : 'var(--accent)',
              border: `1px solid ${confirmDanger ? 'rgba(255,77,77,0.25)' : 'rgba(0,208,124,0.25)'}`,
              color: '#FFFFFF', fontWeight: 800,
              cursor: 'pointer', fontSize: '14px', transition: 'all 0.15s',
              boxShadow: confirmDanger ? '0 8px 20px rgba(255,77,77,0.2)' : '0 8px 20px rgba(0,208,124,0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = confirmDanger ? '#E83E3E' : '#00B86A';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = confirmDanger ? 'var(--danger)' : 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );

  // Render into document.body via portal — escapes any overflow/transform context
  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}
