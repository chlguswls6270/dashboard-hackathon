'use client';

import { useState } from 'react';
import { type ProcessedData, type AlertItem } from '@/lib/types';
import { X, BellRing } from 'lucide-react';

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
    const v = selectedItem.data.currentPrice || selectedItem.data.currentValue || selectedItem.data.nav || selectedItem.data.currentRate || selectedItem.data.currentYield;
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative glass z-10 p-6 sm:p-8 rounded-3xl max-w-md w-full mx-4 border animate-in slide-in-from-bottom-4 duration-300 shadow-2xl" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-white/50 hover:text-white" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-400">
            <BellRing size={20} />
          </div>
          <h2 className="text-xl font-bold">새 알림 추가</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">알림 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 삼성전자 익절 타이밍"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">대상 종목</label>
            <select
              value={targetItemId}
              onChange={(e) => setTargetItemId(e.target.value)}
              className="w-full bg-[#1a1b26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
              required
            >
              {cachedData.map(d => (
                <option key={d.id} value={d.id}>
                  [{d.categoryKo}] {d.title} {d.data.ticker ? `(${d.data.ticker})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              목표 가격 <span className="text-xs text-indigo-400 ml-1">{currentValStr}</span>
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="가격 입력"
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                className="w-32 bg-[#1a1b26] border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none text-center"
              >
                <option value="above">이상 도달 시</option>
                <option value="below">이하 도달 시</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !targetItemId || !targetPrice}
            className="w-full mt-2 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg bg-indigo-500 hover:bg-indigo-600"
          >
            알림 생성하기
          </button>
        </form>
      </div>
    </div>
  );
}
