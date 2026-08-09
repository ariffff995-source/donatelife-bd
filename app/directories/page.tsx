'use client';

import { Suspense } from 'react';
import DirectoryView from '@/src/views/DirectoryView';

export default function DirectoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <DirectoryView />
    </Suspense>
  );
}
