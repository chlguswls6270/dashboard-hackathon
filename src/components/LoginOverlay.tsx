'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function LoginOverlay({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative glass z-10 p-8 rounded-3xl max-w-md w-full mx-4 border animate-in slide-in-from-bottom-8 duration-500 shadow-2xl" style={{ borderColor: 'var(--border)' }}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--brand-blue))', color: '#FFFFFF' }}>
            <User size={32} />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 gradient-text">모아차트에 오신 것을 환영합니다!</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            개인화된 포트폴리오와 맞춤형 투자 분석을 위해<br />사용하실 닉네임을 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임 입력 (예: 주식왕)"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--brand-blue))' }}
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
