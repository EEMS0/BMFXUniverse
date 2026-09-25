import type { MetadataRoute } from 'next'

import { publicProjects } from '@/content/projects'
import { IS_STATIC_PREVIEW } from '@/lib/paths'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

// Built once at build time (required for the static GitHub Pages export).
export const dynamic = 'force-static'

/** Lists pages only for the real production domain (NEXT_PUBLIC_SITE_URL), never for previews. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  if (!base || IS_STATIC_PREVIEW) return []
  return [
    { url: absoluteUrl(base, '/'), changeFrequency: 'monthly', priority: 1 },
    ...publicProjects.map((project) => ({
      url: absoluteUrl(base, `/work/${project.slug}`),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
