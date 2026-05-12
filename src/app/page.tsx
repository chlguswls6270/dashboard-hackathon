'use client';

import { useState, useEffect, useRef } from 'react';
import { CATEGORY_META, type CategoryKey, type ProcessedData, type AlertItem } from '@/lib/types';
import { saveToCache, loadAllFromCache, deleteFromCache } from '@/lib/cache';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import UploadPanel from '@/components/UploadPanel';
import CategorySummaryPage from '@/components/CategorySummaryPage';
import DataViewer from '@/components/DataViewer';
import HomeDashboard from '@/components/HomeDashboard';
import LoginOverlay from '@/components/LoginOverlay';
import MyPageDashboard from '@/components/MyPageDashboard';
import PortfolioFeedPage from '@/components/PortfolioFeedPage';
import UploadedDataDashboard from '@/components/UploadedDataDashboard';
import SearchResultsDashboard from '@/components/SearchResultsDashboard';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export type NoticeStatus = 'processing' | 'success' | 'error' | 'pending_approval';

export interface ProcessNotice {
  id: string;
  status: NoticeStatus;
  title: string;
  message: string;
  targetItemId?: string;
  pendingData?: ProcessedData;
  previousData?: ProcessedData;
  timestamp: number;
}

export default function DashboardPage() {
  const [cachedData, setCachedData] = useState<ProcessedData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeItem, setActiveItem] = useState<ProcessedData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingName, setProcessingName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<ProcessNotice[]>([]);

  const addOrUpdateNotice = (notice: Partial<ProcessNotice> & { id: string }) => {
    setNotices(prev => {
      const existingIdx = prev.findIndex(n => n.id === notice.id);
      let newNotices = [...prev];
      if (existingIdx >= 0) {
        newNotices[existingIdx] = { ...newNotices[existingIdx], ...notice, timestamp: Date.now() };
      } else {
        newNotices.unshift({ ...notice, timestamp: Date.now() } as ProcessNotice);
      }
      
      newNotices.sort((a, b) => {
        const aCompleted = ['success', 'error', 'pending_approval'].includes(a.status);
        const bCompleted = ['success', 'error', 'pending_approval'].includes(b.status);
        if (aCompleted && !bCompleted) return -1;
        if (!aCompleted && bCompleted) return 1;
        return b.timestamp - a.timestamp; // 나중에 뜬 게 위로
      });
      
      return newNotices;
    });
  };

  const removeNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const activeTabRef = useRef(activeTab);
  const mainRef = useRef<HTMLElement>(null);

  // User State
  const [userName, setUserName] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentViews, setRecentViews] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activeTab, activeItem?.id, searchQuery]);

  // Load user data on mount
  useEffect(() => {
    setIsClient(true);
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
    
    const savedFavs = localStorage.getItem('favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedViews = localStorage.getItem('recentViews');
    if (savedViews) setRecentViews(JSON.parse(savedViews));

    const savedAlerts = localStorage.getItem('alerts');
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
  }, []);

  const handleLogin = (name: string) => {
    localStorage.setItem('userName', name);
    setUserName(name);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleAddAlert = (alert: Omit<AlertItem, 'id' | 'createdAt'>) => {
    const newAlert: AlertItem = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: Date.now()
    };
    setAlerts(prev => {
      const next = [newAlert, ...prev];
      localStorage.setItem('alerts', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(prev => {
      const next = prev.map(a => a.id === id ? { ...a, active: !a.active } : a);
      localStorage.setItem('alerts', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => {
      const next = prev.filter(a => a.id !== id);
      localStorage.setItem('alerts', JSON.stringify(next));
      return next;
    });
  };

  const refreshCache = async () => {
    const items = await loadAllFromCache();
    setCachedData(items);
  };

  // Load all cached items on mount
  useEffect(() => {
    refreshCache().then(async () => {
      setProcessing(true);
      try {
        const res = await fetch('/api/dummy/all');
        const result = await res.json();
        if (result.items) {
          for (const item of result.items) {
            await saveToCache(item);
          }
          await refreshCache();
        }
      } catch (err) {
        console.error("Failed to auto-load dummy data", err);
      } finally {
        setProcessing(false);
      }
    });
  }, []);

  const handleProcess = async (file: File | null, dummyCat?: string) => {
    setProcessing(true);
    setError(null);
    const startedFromTab = activeTabRef.current;
    const taskId = `process_${Date.now()}`;
    try {
      if (dummyCat) {
        const noticeName = `${CATEGORY_META[dummyCat as CategoryKey].ko} 데이터`;
        setProcessingName(noticeName);
        addOrUpdateNotice({
          id: taskId,
          status: 'processing',
          title: '데이터 불러오는 중',
          message: `${noticeName}를 준비하고 있습니다.`,
        });
        const res = await fetch(`/api/dummy/category/${dummyCat}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        
        for (const item of result.items) {
          await saveToCache(item);
        }
        
        await refreshCache();
        addOrUpdateNotice({
          id: taskId,
          status: 'success',
          title: '데이터 불러오기 완료',
          message: `${noticeName}가 준비되었습니다.`,
        });
        if (activeTabRef.current === startedFromTab) {
          setActiveTab(dummyCat);
          setActiveItem(null);
        }
      } else if (file) {
        const noticeName = file.name;
        setProcessingName(noticeName);
        addOrUpdateNotice({
          id: taskId,
          status: 'processing',
          title: 'AI 분석 진행 중',
          message: `${noticeName}을 분석하고 있습니다.`,
        });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name);

        const res = await fetch('/api/process', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        
        const item = result;
        if (!item.id) item.id = `${item.category}_${Date.now()}`;
        if (!item.data) item.data = {};
        item.data.isUserUploaded = true;
        
        await saveToCache(item);
        await refreshCache();
        addOrUpdateNotice({
          id: taskId,
          status: 'success',
          title: 'AI 분석 완료',
          message: `${item.title || noticeName} 분석이 완료되었습니다.`,
          targetItemId: item.id,
        });
        if (activeTabRef.current === startedFromTab) {
          setActiveTab('uploaded');
          setActiveItem(item);
        }
      }
    } catch (err: any) {
      const message = err.message || '데이터 처리 중 오류가 발생했습니다.';
      setError(message);
      addOrUpdateNotice({
        id: taskId,
        status: 'error',
        title: '처리 실패',
        message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteFromCache(id);
    await refreshCache();
    if (activeItem?.id === id) {
      setActiveItem(null);
    }
  };

  const handleUpdateItem = async (updatedData: ProcessedData) => {
    await saveToCache(updatedData);
    await refreshCache();
    if (activeItem?.id === updatedData.id) {
      setActiveItem(updatedData);
    }
  };

  const handleReanalyzeRequest = async (currentData: ProcessedData, prompt: string) => {
    const taskId = `reanalyze_${currentData.id}_${Date.now()}`;
    addOrUpdateNotice({
      id: taskId,
      status: 'processing',
      title: 'AI 재분석 진행 중',
      message: `${currentData.title}의 새로운 차트를 생성하고 있습니다.`,
    });

    try {
      const res = await fetch('/api/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentData, prompt })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      result.id = currentData.id;
      if (result.data) result.data.isUserUploaded = (currentData.data as any)?.isUserUploaded;
      
      addOrUpdateNotice({
        id: taskId,
        status: 'pending_approval',
        title: '재분석 완료',
        message: `${currentData.title}의 새로운 분석 결과가 준비되었습니다.`,
        pendingData: result,
        previousData: currentData,
        targetItemId: currentData.id,
      });

      if (activeItem?.id === currentData.id) {
        setActiveItem(result);
      }
    } catch (err: any) {
      console.error(err);
      addOrUpdateNotice({
        id: taskId,
        status: 'error',
        title: '재분석 실패',
        message: '재분석 중 오류가 발생했습니다.',
      });
    }
  };

  const handleApproveReanalyze = async (taskId: string, pendingData: ProcessedData) => {
    await saveToCache(pendingData);
    await refreshCache();
    if (activeItem?.id === pendingData.id) {
      setActiveItem(pendingData);
    }
    removeNotice(taskId);
  };

  const handleRejectReanalyze = (taskId: string, previousData?: ProcessedData) => {
    if (previousData && activeItem?.id === previousData.id) {
      setActiveItem(previousData);
    }
    removeNotice(taskId);
  };

  const handleSelectTab = async (tab: string) => {
    setActiveTab(tab);
    setActiveItem(null);
    setSearchQuery('');

    // 카테고리 탭이면 항상 최신 API 데이터로 갱신 (캐시 stale 방지)
    const validCategories = Object.keys(CATEGORY_META) as CategoryKey[];
    if (validCategories.includes(tab as CategoryKey)) {
      try {
        const res = await fetch(`/api/dummy/category/${tab}`);
        const result = await res.json();
        if (result.items) {
          for (const item of result.items) {
            await saveToCache(item);
          }
          await refreshCache();
        }
      } catch (err) {
        console.warn('Failed to refresh category data:', err);
      }
    }
  };

  const handleSelectItem = (item: ProcessedData) => {
    // Do not change activeTab here, so the back button returns to the previous context
    setActiveItem(item);
    
    // Track recent views
    setRecentViews(prev => {
      const next = [item.id, ...prev.filter(id => id !== item.id)].slice(0, 10);
      localStorage.setItem('recentViews', JSON.stringify(next));
      return next;
    });
  };

  const handleBackToSummary = () => {
    setActiveItem(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('favorites');
    localStorage.removeItem('recentViews');
    localStorage.removeItem('alerts');
    setUserName(null);
    setFavorites([]);
    setRecentViews([]);
    setAlerts([]);
    setActiveTab('home');
    setActiveItem(null);
  };

  const handleOpenNoticeTarget = async (id: string) => {
    const items = await loadAllFromCache();
    const target = items.find(item => item.id === id);
    if (!target) return;

    setCachedData(items);
    setSearchQuery('');
    setActiveTab('uploaded');
    handleSelectItem(target);
  };

  const activeCategory = Object.keys(CATEGORY_META).includes(activeTab) ? activeTab as CategoryKey : null;
  const activeCategoryItems = activeCategory ? cachedData.filter(d => d.category === activeCategory) : [];

  const searchResults = searchQuery.trim() ? cachedData.filter(item => {
    const q = searchQuery.toLowerCase();
    const title = item.title?.toLowerCase() || '';
    const summary = item.summary?.toLowerCase() || '';
    const ticker = (item.data as any)?.ticker?.toLowerCase() || (item.data as any)?.symbol?.toLowerCase() || '';
    const categoryKo = item.categoryKo?.toLowerCase() || '';
    return title.includes(q) || summary.includes(q) || ticker.includes(q) || categoryKo.includes(q);
  }) : [];

  return (
    <div className="flex h-screen overflow-hidden bg-grid" style={{ background: 'var(--bg-primary)' }}>
      {isClient && !userName && <LoginOverlay onLogin={handleLogin} />}
      {/* The unified notices stack is rendered below main content */}
      
      {/* Sidebar */}
      <Sidebar
        cachedData={cachedData}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          activeData={activeItem}
          onBack={activeItem ? handleBackToSummary : undefined}
          userName={userName}
          onUserClick={() => { setActiveTab('mypage'); setActiveItem(null); }}
          searchQuery={searchQuery}
          onSearch={(q) => {
            setSearchQuery(q);
            if (q && activeItem) {
              setActiveItem(null);
            }
          }}
        />

        <main ref={mainRef} className="flex-1 overflow-auto" style={{ padding: '40px 48px' }}>
          {searchQuery && !activeItem ? (
            <SearchResultsDashboard
              items={searchResults}
              onSelectItem={handleSelectItem}
              query={searchQuery}
            />
          ) : activeTab === 'mypage' && userName && !activeItem ? (
            <MyPageDashboard 
              userName={userName}
              cachedData={cachedData}
              favorites={favorites}
              recentViews={recentViews}
              alerts={alerts}
              onSelectItem={handleSelectItem}
              onAddAlert={handleAddAlert}
              onToggleAlert={handleToggleAlert}
              onDeleteAlert={handleDeleteAlert}
              onLogout={handleLogout}
            />
          ) : activeTab === 'upload' ? (
            <UploadPanel
              onProcess={handleProcess}
              processing={processing}
              processingName={processingName}
              error={error}
              onClose={() => setActiveTab('home')}
            />
          ) : activeTab === 'uploaded' && !activeItem ? (
            <UploadedDataDashboard
              items={cachedData.filter((item: any) => item.data?.isUserUploaded === true).reverse()}
              onSelectItem={handleSelectItem}
              onDeleteItem={handleDeleteItem}
            />
          ) : activeTab === 'home' && !activeItem ? (
            <HomeDashboard 
              cachedData={cachedData} 
              onSelectTab={handleSelectTab} 
              onSelectItem={handleSelectItem} 
            />
          ) : activeCategory && !activeItem && activeCategory === 'portfolio' ? (
            <PortfolioFeedPage
              items={activeCategoryItems}
              onSelectItem={handleSelectItem}
            />
          ) : activeCategory && !activeItem ? (
            <CategorySummaryPage
              category={activeCategory}
              items={activeCategoryItems}
              onSelectItem={handleSelectItem}
            />
          ) : activeItem ? (
            <DataViewer 
              data={activeItem} 
              isFavorite={favorites.includes(activeItem.id)}
              onBack={handleBackToSummary}
              onToggleFavorite={() => handleToggleFavorite(activeItem.id)}
              onUpdate={handleUpdateItem}
              onRequestReanalyze={handleReanalyzeRequest}
              isReanalyzing={notices.some(n => n.status === 'processing' && n.id.startsWith(`reanalyze_${activeItem.id}`))}
            />
          ) : (
            <HomeDashboard 
              cachedData={cachedData} 
              onSelectTab={handleSelectTab} 
              onSelectItem={handleSelectItem} 
            />
          )}
        </main>
      </div>

      <div style={{
        position: 'fixed', top: '96px', right: '32px', zIndex: 1000,
        display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end',
        pointerEvents: 'none'
      }}>
        {notices.map(notice => (
          <ProcessNoticeCard 
            key={notice.id} 
            notice={notice} 
            onClose={() => removeNotice(notice.id)}
            onOpenTarget={handleOpenNoticeTarget}
            onApprove={() => notice.pendingData && handleApproveReanalyze(notice.id, notice.pendingData)}
            onReject={() => handleRejectReanalyze(notice.id, notice.previousData)}
            onGoToTarget={() => {
              if (notice.targetItemId) {
                const target = notice.pendingData || cachedData.find(item => item.id === notice.targetItemId);
                if (target) {
                  setActiveItem(target);
                }
              }
            }}
            isActiveItem={activeItem?.id === notice.targetItemId}
          />
        ))}
      </div>
    </div>
  );
}

function ProcessNoticeCard({ 
  notice, onClose, onOpenTarget, onApprove, onReject, onGoToTarget, isActiveItem 
}: { 
  notice: ProcessNotice; onClose: () => void; onOpenTarget: (id: string) => void; 
  onApprove: () => void; onReject: () => void; onGoToTarget: () => void; isActiveItem: boolean;
}) {
  const isProcessing = notice.status === 'processing';
  const isSuccess = notice.status === 'success';
  const isPendingApproval = notice.status === 'pending_approval';
  
  const canOpenTarget = Boolean(isSuccess && notice.targetItemId);
  
  let color = 'var(--text-primary)';
  let bg = '#FFFFFF';
  let iconBg = 'var(--bg-secondary)';
  let iconColor = 'var(--text-secondary)';
  
  if (isProcessing) {
    iconColor = 'var(--brand-blue)';
    iconBg = 'rgba(0,122,255,0.08)';
  } else if (isSuccess) {
    iconColor = 'var(--success)';
    iconBg = 'var(--brand-green-soft)';
  } else if (isPendingApproval) {
    iconColor = 'var(--success)';
    iconBg = 'var(--brand-green-soft)';
  } else {
    iconColor = 'var(--danger)';
    iconBg = 'var(--brand-red-soft)';
  }

  return (
    <div
      className="animate-fade-up"
      onClick={() => {
        if (canOpenTarget && notice.targetItemId) onOpenTarget(notice.targetItemId);
      }}
      role={canOpenTarget ? 'button' : undefined}
      tabIndex={canOpenTarget ? 0 : undefined}
      onKeyDown={(e) => {
        if (!canOpenTarget || !notice.targetItemId) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenTarget(notice.targetItemId);
        }
      }}
      style={{
        width: '320px',
        background: bg,
        border: '1px solid var(--border)',
        borderRadius: '14px',
        boxShadow: '0 18px 46px rgba(15, 23, 42, 0.14)',
        padding: '14px 16px',
        pointerEvents: 'auto',
        cursor: canOpenTarget ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 
           isPendingApproval ? <Sparkles size={18} /> : 
           isSuccess ? <CheckCircle2 size={18} /> : 
           <AlertCircle size={18} />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '3px' }}>
            {notice.title}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {isPendingApproval && isActiveItem ? '새로운 결과가 준비되었습니다. 승인하여 기존 데이터를 대체하시겠습니까?' : notice.message}
          </p>
          {canOpenTarget && (
            <p style={{ fontSize: '11px', color: 'var(--brand-green-dark)', fontWeight: 800, marginTop: '6px' }}>
              클릭해서 상세 보기
            </p>
          )}
        </div>
        {!isProcessing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="알림 닫기"
            style={{
              color: 'var(--text-muted)', background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px',
            }}
          >
            ×
          </button>
        )}
      </div>

      {isProcessing && (
        <div style={{ marginTop: '12px', height: '3px', borderRadius: '999px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
          <div style={{ width: '42%', height: '100%', borderRadius: '999px', background: iconColor, animation: 'progress-slide 1.2s ease-in-out infinite' }} />
        </div>
      )}

      {isPendingApproval && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingLeft: '46px' }}>
          {isActiveItem ? (
            <>
              <button
                onClick={onReject}
                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                거절
              </button>
              <button
                onClick={onApprove}
                style={{ flex: 1, background: 'var(--brand-blue)', border: 'none', color: '#fff', padding: '6px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                승인
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onReject}
                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                무시
              </button>
              <button
                onClick={onGoToTarget}
                style={{ flex: 1, background: 'var(--brand-blue)', border: 'none', color: '#fff', padding: '6px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                보러 가기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
