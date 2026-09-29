import type { MetadataRoute } from 'next'

import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

// Built once at build time (also required for static exports).
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(base ? { sitemap: absoluteUrl(base, '/sitemap.xml') } : {}),
  }
}
