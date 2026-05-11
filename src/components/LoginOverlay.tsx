'use client';

import { useState, KeyboardEvent } from 'react';
import { BarChart2, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginOverlay({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onLogin(name.trim());
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name.trim()) onLogin(name.trim());
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Card */}
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '24px',
          padding: '48px 44px 40px',
          maxWidth: '420px',
          width: 'calc(100% - 32px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,208,124,0.08)',
          animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
        `}</style>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: 'center' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00D07C, #007AFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,208,124,0.3)',
          }}>
            <BarChart2 size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '20px', background: 'linear-gradient(135deg, #00D07C, #007AFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            모아차트
          </span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles size={16} style={{ color: '#00D07C' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#00A860', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              AI 투자 대시보드
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1.3, marginBottom: '10px' }}>
            환영합니다! 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.6 }}>
            개인화 분석을 위해<br />사용하실 닉네임을 입력해주세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="닉네임 입력 (예: 주식왕)"
              autoFocus
              maxLength={20}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '14px 20px',
                fontSize: '15px',
                fontWeight: 500,
                color: '#1A1A1A',
                background: '#F8F9FA',
                border: focused ? '2px solid #00D07C' : '2px solid #E5E7EB',
                borderRadius: '14px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: focused ? '0 0 0 4px rgba(0,208,124,0.1)' : 'none',
              }}
            />
            {name.length > 0 && (
              <span style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '11px', color: '#9CA3AF',
              }}>
                {name.length}/20
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: name.trim()
                ? 'linear-gradient(135deg, #00D07C, #007AFF)'
                : '#E5E7EB',
              color: name.trim() ? '#FFFFFF' : '#9CA3AF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: name.trim() ? '0 4px 16px rgba(0,208,124,0.3)' : 'none',
              transform: 'translateY(0)',
            }}
            onMouseEnter={e => {
              if (name.trim()) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,208,124,0.4)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = name.trim() ? '0 4px 16px rgba(0,208,124,0.3)' : 'none';
            }}
          >
            대시보드 시작하기
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9CA3AF' }}>
          닉네임은 이 기기에만 저장됩니다
        </p>

        {/* Decorative accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '60px', height: '4px', borderRadius: '0 0 4px 4px',
          background: 'linear-gradient(90deg, #00D07C, #007AFF)',
        }} />
      </div>
    </div>
  );
}
