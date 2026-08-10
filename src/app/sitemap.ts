import { MetadataRoute } from 'next';
import { getAllFeatureSettings } from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://donatelifebd.com';

  const settings = await getAllFeatureSettings();
  const hiddenKeys = new Set(
    settings.filter((s) => !s.enabled || s.status === 'Hidden').map((s) => s.featureKey)
  );

  const routeDefinitions: Array<{ route: string; featureKey?: string; priority?: number; changeFrequency?: 'hourly' | 'daily' | 'weekly' }> = [
    { route: '', priority: 1.0, changeFrequency: 'hourly' },
    { route: '/donors', priority: 0.9, changeFrequency: 'daily' },
    { route: '/search', priority: 0.9, changeFrequency: 'daily' },
    { route: '/requests', priority: 0.9, changeFrequency: 'hourly' },
    { route: '/helpdesk', priority: 0.8, changeFrequency: 'daily' },
    { route: '/hospitals', featureKey: 'hospitals', priority: 0.7, changeFrequency: 'daily' },
    { route: '/blood-banks', featureKey: 'blood-banks', priority: 0.7, changeFrequency: 'daily' },
    { route: '/ambulances', featureKey: 'ambulances', priority: 0.7, changeFrequency: 'daily' },
    { route: '/directories', priority: 0.7, changeFrequency: 'daily' },
    { route: '/blog', featureKey: 'blog', priority: 0.7, changeFrequency: 'daily' },
    { route: '/auth', priority: 0.5, changeFrequency: 'weekly' },
    { route: '/dashboard', priority: 0.5, changeFrequency: 'weekly' },
  ];

  const activeRoutes = routeDefinitions.filter(
    (item) => !item.featureKey || !hiddenKeys.has(item.featureKey)
  );

  return activeRoutes.map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency || 'daily',
    priority: item.priority || 0.7,
  }));
}
