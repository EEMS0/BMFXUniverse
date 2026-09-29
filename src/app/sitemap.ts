import type { MetadataRoute } from 'next'

import { MERCH_PATH } from '@/content/navigation'
import { publicProjects } from '@/content/projects'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

// Built once at build time (also required for static exports).
export const dynamic = 'force-static'

/** Lists pages only when the real public URL is configured (NEXT_PUBLIC_SITE_URL). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  if (!base) return []
  return [
    { url: absoluteUrl(base, '/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl(base, MERCH_PATH), changeFrequency: 'weekly', priority: 0.9 },
    ...publicProjects.map((project) => ({
      url: absoluteUrl(base, `/work/${project.slug}`),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
