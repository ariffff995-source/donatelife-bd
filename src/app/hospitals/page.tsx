import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import HospitalsView from '@/src/views/HospitalsView';
import { MaintenanceView } from '@/src/components/MaintenanceView';
import { getFeatureSetting } from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default async function HospitalsPage() {
  const setting = await getFeatureSetting('hospitals');

  if (setting.status === 'Hidden') {
    notFound();
  }

  if (setting.status === 'Maintenance') {
    return <MaintenanceView featureName="Hospitals & Clinics Directory" />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <HospitalsView />
    </Suspense>
  );
}
