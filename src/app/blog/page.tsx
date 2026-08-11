import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import BlogViewWrapper from '@/src/views/BlogViewWrapper';
import { MaintenanceView } from '@/src/components/MaintenanceView';
import { getFeatureSetting } from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const setting = await getFeatureSetting('blog');

  if (setting.status === 'Hidden') {
    notFound();
  }

  if (setting.status === 'Maintenance') {
    return <MaintenanceView featureName="Health & Donor Blog" />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      }
    >
      <BlogViewWrapper />
    </Suspense>
  );
}
