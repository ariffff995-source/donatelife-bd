'use client';

import { Suspense } from 'react';
import DashboardView from '@/src/views/DashboardView';
import AuthView from '@/src/views/AuthView';
import { useAppContext } from '@/src/providers';

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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
