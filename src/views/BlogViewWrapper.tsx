'use client';

import dynamic from 'next/dynamic';
import { useAppContext } from '@/src/providers';

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
  </div>
);

const BlogView = dynamic(() => import('@/src/views/BlogView'), {
  ssr: false,
  loading: PageSpinner,
});

export default function BlogViewWrapper() {
  const { onNavigate } = useAppContext();
  return <BlogView onNavigate={onNavigate} />;
}
