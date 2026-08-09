'use client';

import { Suspense } from 'react';
import EmergencyRequestsView from '@/src/views/EmergencyRequestsView';
import { useAppContext } from '@/src/providers';

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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <RequestsContent />
    </Suspense>
  );
}
