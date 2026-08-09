import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Providers, useAppContext } from './providers';
import PageShell from './page-shell';
import HomeView from './views/HomeView';
import { BloodGroup } from './types';
import './index.css';

// Lazy load non-critical views for code splitting and instant LCP
const SearchView = lazy(() => import('./views/SearchView'));
const EmergencyRequestsView = lazy(() => import('./views/EmergencyRequestsView'));
const DirectoryView = lazy(() => import('./views/DirectoryView'));
const HelpdeskView = lazy(() => import('./views/HelpdeskView'));
const BlogView = lazy(() => import('./views/BlogView'));
const DashboardView = lazy(() => import('./views/DashboardView'));
const AdminView = lazy(() => import('./views/AdminView'));
const AuthView = lazy(() => import('./views/AuthView'));

function ViewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    searchFilters,
    setSearchFilters,
    allRequests,
    stats,
    currentUser,
    setCurrentUser,
    loadRequests,
  } = useAppContext();

  const handleInstantSearch = (filters: any) => {
    setSearchFilters({
      bloodGroup: filters.bloodGroup as BloodGroup | '',
      division: filters.division,
      district: filters.district,
      upazila: filters.upazila,
      availableOnly: true,
    });
    setActiveTab('search');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onNavigate={setActiveTab}
            onInstantSearch={handleInstantSearch}
            activeRequests={allRequests}
            stats={stats}
            currentUser={currentUser}
          />
        );
      case 'search':
        return (
          <SearchView
            currentUser={currentUser}
            initialFilters={searchFilters}
            onFiltersChange={setSearchFilters}
          />
        );
      case 'requests':
        return (
          <EmergencyRequestsView
            currentUser={currentUser}
            allRequests={allRequests}
            onRefreshRequests={loadRequests}
            onNavigate={setActiveTab}
          />
        );
      case 'helpdesk':
        return <HelpdeskView onNavigate={setActiveTab} />;
      case 'directories':
        return <DirectoryView />;
      case 'blog':
        return <BlogView onNavigate={setActiveTab} />;
      case 'dashboard':
        return currentUser ? (
          <DashboardView
            currentUser={currentUser}
            onProfileUpdate={setCurrentUser}
            allRequests={allRequests}
            onRefreshRequests={loadRequests}
          />
        ) : (
          <AuthView onAuthSuccess={setCurrentUser} onNavigate={setActiveTab} />
        );
      case 'admin':
        return (
          <AdminView
            currentUser={currentUser}
            allRequests={allRequests}
            onRefreshRequests={loadRequests}
          />
        );
      case 'auth':
        return <AuthView onAuthSuccess={setCurrentUser} onNavigate={setActiveTab} />;
      default:
        return (
          <HomeView
            onNavigate={setActiveTab}
            onInstantSearch={handleInstantSearch}
            activeRequests={allRequests}
            stats={stats}
            currentUser={currentUser}
          />
        );
    }
  };

  return (
    <PageShell>
      <Suspense fallback={<ViewLoader />}>
        {renderView()}
      </Suspense>
    </PageShell>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <AppContent />
    </Providers>
  </React.StrictMode>
);
