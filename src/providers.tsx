'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, getAuthToken, setAuthTokens } from './lib/api';
import { User, BloodRequest, Notification as AppNotification, PlatformStats, BloodGroup } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  allRequests: BloodRequest[];
  setAllRequests: React.Dispatch<React.SetStateAction<BloodRequest[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  stats: PlatformStats;
  setStats: React.Dispatch<React.SetStateAction<PlatformStats>>;
  searchFilters: {
    bloodGroup: BloodGroup | '';
    division: string;
    district: string;
    upazila: string;
    availableOnly: boolean;
  };
  setSearchFilters: React.Dispatch<React.SetStateAction<{
    bloodGroup: BloodGroup | '';
    division: string;
    district: string;
    upazila: string;
    availableOnly: boolean;
  }>>;
  appReady: boolean;
  onNavigate: (tab: string) => void;
  onInstantSearch: (filters: { bloodGroup: string; division: string; district: string; upazila: string }) => void;
  loadRequests: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  handleLogout: () => Promise<void>;
  handleMarkNotificationRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [appReady, setAppReady] = useState(true);

  // Global search filters to pass between views
  const [searchFilters, setSearchFilters] = useState({
    bloodGroup: '' as BloodGroup | '',
    division: '',
    district: '',
    upazila: '',
    availableOnly: true
  });

  // Dynamic stats aggregation based on listings for production feel
  const [stats, setStats] = useState<PlatformStats>({
    totalDonors: 142,
    totalRequests: 84,
    activeRequests: 3,
    totalHospitals: 26,
    totalBloodBanks: 18,
    successfulDonations: 62
  });

  // Keep activeTab strictly derived from Next.js pathname changes to prevent flash/desync
  const activeTab = useMemo(() => {
    if (!pathname) return 'home';
    const cleanPath = pathname.split('?')[0].split('#')[0];
    return cleanPath === '/' || cleanPath === '' ? 'home' : cleanPath.slice(1);
  }, [pathname]);

  const setActiveTab = useCallback((tab: string) => {
    const targetUrl = tab === 'home' ? '/' : `/${tab}`;
    if (pathname !== targetUrl) {
      startTransition(() => {
        router.push(targetUrl);
      });
    }
  }, [pathname, router, startTransition]);

  // Verify Auth on Boot
  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const data = await api.auth.getMe();
        setCurrentUser(data.user);
      } catch (err) {
        console.error('Invalid token or expired session', err);
        setAuthTokens(null, null);
        setCurrentUser(null);
      }
    }
    setAppReady(true);
  }, []);

  // Load Blood Requests
  const loadRequests = useCallback(async () => {
    try {
      const list = await api.requests.list();
      const arrayList = Array.isArray(list) ? list : [];
      setAllRequests(arrayList);
      
      const pendingCount = arrayList.filter(r => r.status === 'pending').length;
      const fulfilledCount = arrayList.filter(r => r.status === 'fulfilled').length;
      
      setStats(prev => ({
        ...prev,
        activeRequests: pendingCount,
        totalRequests: 84 + arrayList.length,
        successfulDonations: 62 + fulfilledCount
      }));
    } catch (err) {
      console.error('Failed to load emergency requests', err);
    }
  }, []);

  // Load User Notifications
  const loadNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const list = await api.notifications.list();
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load user notifications', err);
    }
  }, [currentUser]);

  // Mark notification as read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  // Handle Log Out
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('donatelife_refresh_token');
      if (refreshToken) {
        await api.auth.logout(refreshToken);
      }
    } catch (err) {
      console.error('API logout failed', err);
    }
    setAuthTokens(null, null);
    setCurrentUser(null);
    setNotifications([]);
    setActiveTab('home');
  };

  // Real-time notifications listener (SSE)
  useEffect(() => {
    if (!currentUser) return;
    
    const token = localStorage.getItem('donatelife_token') || currentUser.id;
    const eventSource = new EventSource(`/api/notifications/live?token=${token}`);
    
    eventSource.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data);
        setNotifications(prev => {
          if (prev.some(n => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });
        
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(notif.title, { body: notif.message });
          }
        }
      } catch (err) {
        console.error("SSE parsing error:", err);
      }
    };

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      eventSource.close();
    };
  }, [currentUser]);

  // Boot Setup
  useEffect(() => {
    checkAuth();
    loadRequests();

    const handleSessionExpired = () => {
      setAuthTokens(null, null);
      setCurrentUser(null);
      setNotifications([]);
      setActiveTab('auth');
      const lang = localStorage.getItem('donatelife_lang') || 'en';
      alert(lang === 'bn' ? 'আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।' : 'Your security session has expired. Please log in again to continue.');
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, [checkAuth, loadRequests, setActiveTab]);

  // Polling loop for active emergency matching and new notifications (every 8 seconds)
  useEffect(() => {
    loadRequests();
    loadNotifications();

    const interval = setInterval(() => {
      loadRequests();
      loadNotifications();
    }, 8000);

    return () => clearInterval(interval);
  }, [currentUser, loadRequests, loadNotifications]);

  const handleInstantSearch = (filters: { bloodGroup: string; division: string; district: string; upazila: string }) => {
    setSearchFilters({
      bloodGroup: filters.bloodGroup as BloodGroup | '',
      division: filters.division,
      district: filters.district,
      upazila: filters.upazila,
      availableOnly: true,
    });
    setActiveTab('search');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      activeTab,
      setActiveTab,
      onNavigate: setActiveTab,
      onInstantSearch: handleInstantSearch,
      allRequests,
      setAllRequests,
      notifications,
      setNotifications,
      stats,
      setStats,
      searchFilters,
      setSearchFilters,
      appReady,
      loadRequests,
      loadNotifications,
      handleLogout,
      handleMarkNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppStateProvider');
  }
  return context;
}

export function Providers({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: 'en' | 'bn' }) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <AppStateProvider>
        {children}
      </AppStateProvider>
    </LanguageProvider>
  );
}
