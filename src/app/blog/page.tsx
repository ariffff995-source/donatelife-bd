'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/src/providers';

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

// PERF: Dynamic import for 50KB BlogView — only fetched on /blog navigation
const BlogView = dynamic(() => import('@/src/views/BlogView'), {
  ssr: false,
  loading: PageSpinner,
});

function BlogContent() {
  const { onNavigate } = useAppContext();
  return <BlogView onNavigate={onNavigate} />;
}

export default function BlogPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BlogContent />
    </Suspense>
  );
}
