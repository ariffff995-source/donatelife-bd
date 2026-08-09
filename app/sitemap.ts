import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://donatelifebd.com';

  const routes = [
    '',
    '/search',
    '/requests',
    '/helpdesk',
    '/directories',
    '/blog',
    '/auth',
    '/dashboard',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/requests' ? 'hourly' : 'daily',
    priority: route === '' ? 1.0 : route === '/search' || route === '/requests' ? 0.9 : 0.7,
  }));
}
