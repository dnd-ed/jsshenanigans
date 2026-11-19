import type { MetadataRoute } from 'next';

import { source } from '@/lib/source';
import { basePath, siteUrl } from '@/lib/shared';

// Required for `output: 'export'`.
export const dynamic = 'force-static';

/** The site uses trailing slashes, so keep the sitemap consistent. */
const withSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`);

/**
 * Every page on the site. Fumadocs knows the docs pages; the landing page and
 * the editor are added by hand.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({
    url: withSlash(`${siteUrl}${basePath}${page.url}`),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: withSlash(`${siteUrl}${basePath}/`),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: withSlash(`${siteUrl}${basePath}/editor`),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...docs,
  ];
}