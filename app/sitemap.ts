import type { MetadataRoute } from 'next';
import { eventConfig } from '@/lib/config';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    '/program',
    '/digital-apta',
    '/speakers',
    '/startup-battle',
    '/hackathon',
    '/jas-startuper',
    '/fifa',
    '/zones',
    '/apply',
    '/activate',
    '/privacy',
    '/rules',
    '/contact',
  ].map((path) => ({
    url: eventConfig.siteUrl + path,
    changeFrequency: 'weekly',
    priority: path ? 0.7 : 1,
  }));
}
