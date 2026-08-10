import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AmbulancesView from '@/src/views/AmbulancesView';
import { MaintenanceView } from '@/src/components/MaintenanceView';
import { getFeatureSetting } from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default async function AmbulancesPage() {
  const setting = await getFeatureSetting('ambulances');

  if (setting.status === 'Hidden') {
    notFound();
  }

  if (setting.status === 'Maintenance') {
    return <MaintenanceView featureName="Ambulance Service Directory" />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AmbulancesView />
    </Suspense>
  );
}
