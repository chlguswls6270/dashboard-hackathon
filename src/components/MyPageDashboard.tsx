'use client';

import { useState } from 'react';
import { type ProcessedData, type AlertItem } from '@/lib/types';
import SummaryCard from './SummaryCard';
import AlertModal from './AlertModal';
import { Star, Clock, UploadCloud, BellRing, Wallet, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MyPageDashboardProps {
  userName: string;
  cachedData: ProcessedData[];
  favorites: string[];
  recentViews: string[];
  alerts: AlertItem[];
  onSelectItem: (item: ProcessedData) => void;
  onAddAlert: (alert: Omit<AlertItem, 'id' | 'createdAt'>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const sectionCard = {
  background: 'rgba(20, 27, 45, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '28px',
} as const;

export default function MyPageDashboard({ 
  userName, cachedData, favorites, recentViews, alerts, 
  onSelectItem, onAddAlert, onToggleAlert, onDeleteAlert 
}: MyPageDashboardProps) {
  const [showModal, setShowModal] = useState(false);
  const favoriteItems = cachedData.filter(d => favorites.includes(d.id));
  const recentItems = recentViews.map(id => cachedData.find(d => d.id === id)).filter(Boolean) as ProcessedData[];
  const uploadedItems = cachedData.filter(d => d.data.isUserUploaded);

  const pieData = favoriteItems.length > 0 
    ? favoriteItems.map(item => ({ name: item.title, value: 1000000 + Math.random() * 5000000 }))
    : [{ name: '현금', value: 10000000 }];

  const totalValue = pieData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="flex flex-col animate-fade-up" style={{ gap: '32px' }}>
      
      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.20) 100%)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: '24px',
        padding: '36px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>
            환영합니다,&nbsp;
            <span className="gradient-text">{userName}</span>&nbsp;님! 🌟
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px' }}>
            오늘도 성공적인 투자를 위해 모아차트가 함께합니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: '관심 종목', value: `${favoriteItems.length}개` },
            { label: '업로드 데이터', value: `${uploadedItems.length}개` },
            { label: '알림 설정', value: `${alerts.length}개` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '16px 24px',
              textAlign: 'center',
              minWidth: '96px',
            }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ fontSize: '22px', fontWeight: 800 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* ── Left: Portfolio + Alerts ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Portfolio Pie */}
          <section style={sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Wallet size={18} style={{ color: '#a78bfa' }} />
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>내 포트폴리오 요약</h3>
            </div>
            <div style={{ height: '180px', position: 'relative', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={76}
                    paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => `₩${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '2px' }}>총 자산</span>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>₩{(totalValue / 10000).toFixed(0)}만</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pieData.slice(0, 4).map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', color: 'rgba(255,255,255,0.8)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>₩{(d.value / 10000).toFixed(0)}만</span>
                </div>
              ))}
            </div>
          </section>

          {/* Alerts */}
          <section style={sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BellRing size={18} style={{ color: '#fbbf24' }} />
                <h3 style={{ fontWeight: 700, fontSize: '16px' }}>목표가 알림</h3>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{alerts.length}개 설정됨</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.length > 0 ? alerts.map(alert => {
                const targetItem = cachedData.find(d => d.id === alert.targetItemId);
                return (
                  <div key={alert.id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.name}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {targetItem ? `${targetItem.categoryKo} · ${targetItem.title}` : '알 수 없는 종목'}
                        </p>
                        <p style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>
                          {alert.targetPrice.toLocaleString()} {alert.condition === 'above' ? '이상 ↑' : '이하 ↓'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <button
                          onClick={() => onToggleAlert(alert.id)}
                          style={{
                            width: '38px', height: '20px', borderRadius: '10px', padding: '2px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: alert.active ? 'flex-end' : 'flex-start',
                            background: alert.active ? '#6366f1' : 'rgba(255,255,255,0.15)',
                            transition: 'all 0.2s',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        </button>
                        <button onClick={() => onDeleteAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', padding: '2px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '14px', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                  등록된 알림이 없습니다.
                </div>
              )}
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%', marginTop: '4px', padding: '12px',
                  borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)',
                  background: 'transparent', color: 'rgba(255,255,255,0.45)',
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                + 새 알림 추가하기
              </button>
            </div>
          </section>
        </div>

        {/* ── Right: Favorites / Uploads / Recent ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Favorites */}
          <section>
            <SectionHeader icon={<Star size={18} style={{ color: '#fbbf24' }} fill="#fbbf24" />} title="즐겨찾기 한 항목" />
            {favoriteItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {favoriteItems.map(item => (
                  <SummaryCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<Star size={28} style={{ opacity: 0.2 }} />} line1="아직 즐겨찾기한 항목이 없습니다." line2="데이터 상세 화면의 별표(⭐)를 눌러 추가해보세요!" />
            )}
          </section>

          {/* Uploaded Data */}
          <section>
            <SectionHeader icon={<UploadCloud size={18} style={{ color: '#60a5fa' }} />} title="내가 업로드 한 데이터" />
            {uploadedItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {uploadedItems.map(item => (
                  <SummaryCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<UploadCloud size={28} style={{ opacity: 0.2 }} />} line1="직접 업로드한 커스텀 데이터가 없습니다." />
            )}
          </section>

          {/* Recent Views */}
          <section>
            <SectionHeader icon={<Clock size={18} style={{ color: '#34d399' }} />} title="최근 열람 기록" />
            {recentItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', opacity: 0.75 }}>
                {recentItems.slice(0, 6).map(item => (
                  <SummaryCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<Clock size={28} style={{ opacity: 0.2 }} />} line1="최근 열람한 데이터가 없습니다." />
            )}
          </section>
        </div>
      </div>

      {showModal && (
        <AlertModal
          cachedData={cachedData}
          onClose={() => setShowModal(false)}
          onSave={alert => { onAddAlert(alert); setShowModal(false); }}
        />
      )}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      {icon}
      <h3 style={{ fontWeight: 700, fontSize: '17px' }}>{title}</h3>
    </div>
  );
}

function EmptyState({ icon, line1, line2 }: { icon: React.ReactNode; line1: string; line2?: string }) {
  return (
    <div style={{
      padding: '40px 24px',
      border: '1px dashed rgba(255,255,255,0.12)',
      borderRadius: '16px',
      textAlign: 'center',
      color: 'rgba(255,255,255,0.4)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    }}>
      {icon}
      <p style={{ fontSize: '14px' }}>{line1}</p>
      {line2 && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{line2}</p>}
    </div>
  );
}
