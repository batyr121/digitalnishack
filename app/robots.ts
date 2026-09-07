import { eventConfig } from '@/lib/config';
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/verify', '/certificate', '/auth'],
    },
    sitemap: eventConfig.siteUrl + '/sitemap.xml',
  };
}
