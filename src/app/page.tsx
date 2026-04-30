'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORY_META, type CategoryKey, type ProcessedData, type AlertItem } from '@/lib/types';
import { saveToCache, loadAllFromCache, clearCache } from '@/lib/cache';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import UploadPanel from '@/components/UploadPanel';
import CategorySummaryPage from '@/components/CategorySummaryPage';
import DataViewer from '@/components/DataViewer';
import HomeDashboard from '@/components/HomeDashboard';
import LoginOverlay from '@/components/LoginOverlay';
import MyPageDashboard from '@/components/MyPageDashboard';
import PortfolioFeedPage from '@/components/PortfolioFeedPage';

export default function DashboardPage() {
  const [cachedData, setCachedData] = useState<ProcessedData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeItem, setActiveItem] = useState<ProcessedData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingName, setProcessingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // User State
  const [userName, setUserName] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentViews, setRecentViews] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isClient, setIsClient] = useState(false);

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
      const items = await loadAllFromCache();
      if (items.length === 0) {
        setProcessing(true);
        try {
          const res = await fetch('/api/dummy/all');
          const result = await res.json();
          if (result.items) {
            // Save all items to cache
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
      }
    });
  }, []);

  const handleProcess = async (file: File | null, dummyCat?: string) => {
    setProcessing(true);
    setError(null);
    try {
      if (dummyCat) {
        setProcessingName(`${CATEGORY_META[dummyCat as CategoryKey].ko} 데이터`);
        const res = await fetch(`/api/dummy/category/${dummyCat}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        
        // Save all items to cache
        for (const item of result.items) {
          await saveToCache(item);
        }
        
        await refreshCache();
        setActiveTab(dummyCat);
        setActiveItem(null);
      } else if (file) {
        setProcessingName(file.name);
        const text = await file.text();
        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawData: text, fileName: file.name }),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        
        // Handle single item upload
        const item = result.data;
        // Use a generated id if not present
        if (!item.id) item.id = `${item.category}_${Date.now()}`;
        item.data.isUserUploaded = true;
        
        await saveToCache(item);
        await refreshCache();
        setActiveTab(item.category);
        setActiveItem(item);
      }
    } catch (err: any) {
      setError(err.message || '데이터 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCache = useCallback(async () => {
    await clearCache();
    setActiveTab('home');
    setActiveItem(null);
  }, []);

  const handleSelectTab = async (tab: string) => {
    setActiveTab(tab);
    setActiveItem(null);

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
    setActiveTab(item.category);
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

  const activeCategory = Object.keys(CATEGORY_META).includes(activeTab) ? activeTab as CategoryKey : null;
  const activeCategoryItems = activeCategory ? cachedData.filter(d => d.category === activeCategory) : [];

  return (
    <div className="flex h-screen overflow-hidden bg-grid" style={{ background: 'var(--bg-primary)' }}>
      {isClient && !userName && <LoginOverlay onLogin={handleLogin} />}
      
      {/* Sidebar */}
      <Sidebar
        cachedData={cachedData}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onClearCache={handleClearCache}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          activeData={activeItem}
          onBack={activeItem ? handleBackToSummary : undefined}
          userName={userName}
          onUserClick={() => { setActiveTab('mypage'); setActiveItem(null); }}
        />

        <main className="flex-1 overflow-auto" style={{ padding: '40px 48px' }}>
          {activeTab === 'mypage' && userName ? (
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
            />
          ) : activeTab === 'upload' ? (
            <UploadPanel
              onProcess={handleProcess}
              processing={processing}
              processingName={processingName}
              error={error}
              onClose={() => setActiveTab('home')}
            />
          ) : activeTab === 'home' ? (
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
              onToggleFavorite={() => handleToggleFavorite(activeItem.id)}
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
    </div>
  );
}
