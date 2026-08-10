'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/src/providers';

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

// PERF: Dynamic import for 79KB DashboardView + 34KB AuthView
const DashboardView = dynamic(() => import('@/src/views/DashboardView'), {
  ssr: false,
  loading: PageSpinner,
});

const AuthView = dynamic(() => import('@/src/views/AuthView'), {
  ssr: false,
  loading: PageSpinner,
});

function DashboardContent() {
  const { currentUser, setCurrentUser, allRequests, loadRequests, onNavigate } = useAppContext();

  if (!currentUser) {
    return <AuthView onAuthSuccess={setCurrentUser} onNavigate={onNavigate} />;
  }

  return (
    <DashboardView
      currentUser={currentUser}
      onProfileUpdate={setCurrentUser}
      allRequests={allRequests}
      onRefreshRequests={loadRequests}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}
