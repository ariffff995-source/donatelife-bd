'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/src/providers';

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

// PERF: Dynamic import for 28KB EmergencyRequestsView
const EmergencyRequestsView = dynamic(() => import('@/src/views/EmergencyRequestsView'), {
  ssr: false,
  loading: PageSpinner,
});

function RequestsContent() {
  const { currentUser, allRequests, loadRequests, onNavigate } = useAppContext();

  return (
    <EmergencyRequestsView
      currentUser={currentUser}
      allRequests={allRequests}
      onRefreshRequests={loadRequests}
      onNavigate={onNavigate}
    />
  );
}

export default function EmergencyRequestsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <RequestsContent />
    </Suspense>
  );
}
