'use client';

import { Suspense } from 'react';
import AuthView from '@/src/views/AuthView';
import { useAppContext } from '@/src/providers';

function AuthContent() {
  const { setCurrentUser, onNavigate } = useAppContext();

  return <AuthView onAuthSuccess={setCurrentUser} onNavigate={onNavigate} />;
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
