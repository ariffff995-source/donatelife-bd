import { MetadataRoute } from 'next';
import { getAllFeatureSettings } from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://donatelifebd.com';

  const settings = await getAllFeatureSettings();
  const hiddenDisallows: string[] = [];

  settings.forEach((s) => {
    if (!s.enabled || s.status === 'Hidden') {
      hiddenDisallows.push(`/${s.featureKey}`);
    }
  });

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', ...hiddenDisallows],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
