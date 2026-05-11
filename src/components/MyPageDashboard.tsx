'use client';

import { useState } from 'react';
import { type ProcessedData, type AlertItem } from '@/lib/types';
import SummaryCard from './SummaryCard';
import Sparkline from './Sparkline';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';
import { Star, Clock, BellRing, Wallet, Trash2, FileText, Calendar, LogOut } from 'lucide-react';
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
  onLogout: () => void;
}

const COLORS = ['var(--accent)', 'var(--brand-blue)', '#06b6d4', '#f59e0b', 'var(--danger)', 'var(--brand-green-dark)'];

const sectionCard = {
  background: '#FFFFFF',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '28px',
  boxShadow: 'var(--shadow-card)',
} as const;

export default function MyPageDashboard({ 
  userName, cachedData, favorites, recentViews, alerts, 
  onSelectItem, onAddAlert, onToggleAlert, onDeleteAlert, onLogout
}: MyPageDashboardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const favoriteItems = cachedData.filter(d => favorites.includes(d.id));
  const recentItems = recentViews.map(id => cachedData.find(d => d.id === id)).filter(Boolean) as ProcessedData[];
  const uploadedItems = cachedData.filter(d => (d.data as any).isUserUploaded);

  const pieData = favoriteItems.length > 0 
    ? favoriteItems.map((item, index) => ({ name: item.title, value: 1000000 + ((index + 1) * 733000) % 5000000 }))
    : [{ name: '현금', value: 10000000 }];

  const totalValue = pieData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="flex flex-col animate-fade-up" style={{ gap: '32px' }}>
      
      {/* ── Hero Banner ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.25 }}>
            환영합니다,&nbsp;
            <span className="gradient-text">{userName}</span>&nbsp;님! 🌟
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            오늘도 성공적인 투자를 위해 모아차트가 함께합니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {[
            { label: '관심 종목', value: `${favoriteItems.length}개` },
            { label: '업로드 데이터', value: `${uploadedItems.length}개` },
            { label: '알림 설정', value: `${alerts.length}개` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              width: '112px',
              height: '90px',
              padding: '14px 12px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
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
                    formatter={(val) => `₩${Number(val ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    contentStyle={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', color: '#1A1A1A' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>총 자산</span>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>₩{(totalValue / 10000).toFixed(0)}만</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pieData.slice(0, 4).map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', color: 'var(--text-secondary)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₩{(d.value / 10000).toFixed(0)}만</span>
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
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alerts.length}개 설정됨</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.length > 0 ? alerts.map(alert => {
                const targetItem = cachedData.find(d => d.id === alert.targetItemId);
                return (
                  <div key={alert.id} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {targetItem ? `${targetItem.categoryKo} · ${targetItem.title}` : '알 수 없는 종목'}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--brand-green-dark)', fontWeight: 600 }}>
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
                            background: alert.active ? 'var(--accent)' : 'var(--border-light)',
                            transition: 'all 0.2s',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        </button>
                        <button onClick={() => onDeleteAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s', padding: '2px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  등록된 알림이 없습니다.
                </div>
              )}
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%', marginTop: '4px', padding: '12px',
                  borderRadius: '12px', border: '1px dashed var(--border-light)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--brand-green-dark)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                + 새 알림 추가하기
              </button>
            </div>
          </section>
        </div>

        {/* ── Right: Favorites / Recent ── */}
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

          {/* Recent Views */}
          <section>
            <SectionHeader icon={<Clock size={18} style={{ color: '#34d399' }} />} title="최근 열람 기록" />
            {recentItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {recentItems.slice(0, 8).map(item => (
                  <RecentThumbnailCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<Clock size={28} style={{ opacity: 0.2 }} />} line1="최근 열람한 데이터가 없습니다." />
            )}
          </section>
        </div>
      </div>

      {/* ── Logout ── */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '16px' }}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 28px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: '#FFFFFF',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,77,77,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
          }}
        >
          <LogOut size={14} />
          로그아웃
        </button>
      </div>

      {/* ── Logout Confirm Modal (Portal) ── */}
      {showLogoutConfirm && (
        <ConfirmModal
          icon={<LogOut size={21} />}
          title="로그아웃하시겠어요?"
          description="닉네임과 즐겨찾기 정보가 이 기기에서 삭제됩니다."
          confirmLabel="로그아웃"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => { setShowLogoutConfirm(false); onLogout(); }}
        />
      )}

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
      border: '1px dashed var(--border-light)',
      borderRadius: '16px',
      textAlign: 'center',
      color: 'var(--text-muted)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    }}>
      {icon}
      <p style={{ fontSize: '14px' }}>{line1}</p>
      {line2 && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{line2}</p>}
    </div>
  );
}

function RecentThumbnailCard({ item, onClick }: { item: ProcessedData; onClick: () => void }) {
  const sparkData = getSparkData(item);
  const changePercent = getChangePercent(item);
  const isPositive = changePercent >= 0;
  const color = isPositive ? 'var(--success)' : 'var(--danger)';
  const dateStr = new Date(item.metadata.processedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        e.currentTarget.style.borderColor = 'rgba(0, 208, 124, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,208,124,0.10), rgba(0,122,255,0.08))',
          borderBottom: '1px solid var(--border)',
          minHeight: '170px',
          padding: '34px 22px 22px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 700,
            background: 'var(--brand-green-soft)',
            color: 'var(--brand-green-dark)',
          }}>
            {item.categoryKo}
          </div>
        </div>
        {sparkData.length > 1 ? (
          <div style={{ width: '100%', height: '104px', borderRadius: '14px', background: 'rgba(255,255,255,0.58)', padding: '12px' }}>
            <Sparkline data={sparkData} color={color} width="100%" height="100%" />
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>
            <FileText size={44} />
          </div>
        )}
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.title}
          </h3>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.summary}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
            <Calendar size={12} />
            <span>{dateStr}</span>
          </div>
          {changePercent !== 0 && (
            <span style={{ color, fontSize: '12px', fontWeight: 800 }}>
              {isPositive ? '+' : '-'}{Math.abs(changePercent).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function getSparkData(item: ProcessedData) {
  const d = item.data as any;

  if (!d || typeof d !== 'object') return [];
  if (item.category === 'stock' || item.category === 'crypto' || item.category === 'commodities') {
    return d.priceHistory?.map((h: any) => h.close ?? h.price).filter((v: unknown) => typeof v === 'number').slice(-30) ?? [];
  }
  if (item.category === 'etf' || item.category === 'funds') {
    return (d.priceHistory?.map((h: any) => h.price) ?? d.navHistory?.map((h: any) => h.nav) ?? []).filter((v: unknown) => typeof v === 'number').slice(-30);
  }
  if (item.category === 'portfolio') {
    return d.performanceHistory?.map((h: any) => h.value).filter((v: unknown) => typeof v === 'number').slice(-30) ?? [];
  }
  if (item.category === 'market_indicators') {
    return d.history?.map((h: any) => h.value).filter((v: unknown) => typeof v === 'number').slice(-30) ?? [];
  }
  if (item.category === 'forex') {
    return d.history?.map((h: any) => h.rate).filter((v: unknown) => typeof v === 'number').slice(-30) ?? [];
  }
  if (item.category === 'bonds') {
    return d.yieldHistory?.map((h: any) => h.yield).filter((v: unknown) => typeof v === 'number').slice(-30) ?? [];
  }
  if ('blocks' in d) {
    const metricBlock = d.blocks?.find((b: any) => b.type === 'metrics' && b.data?.[0]?.sparkData);
    return metricBlock?.data?.[0]?.sparkData?.filter((v: unknown) => typeof v === 'number').slice(-30) ?? [];
  }

  return [];
}

function getChangePercent(item: ProcessedData) {
  const d = item.data as any;

  if (!d || typeof d !== 'object') return 0;
  return d.changePercent ?? d.change24h ?? d.returnRate ?? 0;
}
