import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nust-aggregate.vercel.app';
  
  // Main pages
  const routes = [
    '',
    '/aggregate-calculator',
    '/merit-history',
    '/admission-predictor',
    '/preference-generator',
    '/about',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/aggregate-calculator' ? 0.9 : 0.8,
  }));
}

