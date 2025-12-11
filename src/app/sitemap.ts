import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nust-aggregate.vercel.app';
  
  // Main pages - ordered by importance for SEO
  const routes = [
    { path: '', priority: 1.0, changeFreq: 'weekly' }, // Homepage
    { path: '/aggregate-calculator', priority: 0.9, changeFreq: 'weekly' }, // Main feature
    { path: '/merit-history', priority: 0.9, changeFreq: 'weekly' }, // Important content
    { path: '/admission-predictor', priority: 0.8, changeFreq: 'monthly' },
    { path: '/preference-generator', priority: 0.8, changeFreq: 'monthly' },
    { path: '/about', priority: 0.7, changeFreq: 'monthly' },
    { path: '/blog', priority: 0.7, changeFreq: 'weekly' },
    { path: '/contact', priority: 0.6, changeFreq: 'monthly' },
    { path: '/privacy', priority: 0.5, changeFreq: 'yearly' },
    { path: '/terms', priority: 0.5, changeFreq: 'yearly' },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq as 'weekly' | 'monthly' | 'yearly',
    priority: route.priority,
  }));
}

