import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import BloodBanksView from '@/src/views/BloodBanksView';
import { MaintenanceView } from '@/src/components/MaintenanceView';
import { getFeatureSetting } from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default async function BloodBanksPage() {
  const setting = await getFeatureSetting('blood-banks');

  if (setting.status === 'Hidden') {
    notFound();
  }

  if (setting.status === 'Maintenance') {
    return <MaintenanceView featureName="Blood Banks & Storage Directory" />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
        </div>
      }
    >
      <BloodBanksView />
    </Suspense>
  );
}
