import { MetadataRoute } from 'next';

export default function robots() {
  const baseUrl = 'https://www.resumeaionline.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/profile',
          '/dashboard',
          '/result',
          '/ats-result',
          '/success',
          '/admin/',
          '/api/',
        ],
      },
      {
        userAgent: ['AhrefsBot', 'SemrushBot'],
        crawlDelay: 10,
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
