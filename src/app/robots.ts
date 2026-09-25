import type { MetadataRoute } from 'next'

import { IS_STATIC_PREVIEW } from '@/lib/paths'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

// Built once at build time (required for the static GitHub Pages export).
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  // Previews should not be indexed in place of the real site.
  if (IS_STATIC_PREVIEW) return { rules: { userAgent: '*', disallow: '/' } }
  const base = getSiteUrl()
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/enquiry/'] },
    ...(base ? { sitemap: absoluteUrl(base, '/sitemap.xml') } : {}),
  }
}
