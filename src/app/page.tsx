'use client';

import { Suspense } from 'react';
import HomeView from '@/src/views/HomeView';
import { useAppContext } from '@/src/providers';

function HomeContent() {
  const { onNavigate, onInstantSearch, allRequests, stats, currentUser } = useAppContext();

  return (
    <HomeView
      onNavigate={onNavigate}
      onInstantSearch={onInstantSearch}
      activeRequests={allRequests}
      stats={stats}
      currentUser={currentUser}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
