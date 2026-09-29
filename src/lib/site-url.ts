/**
 * The real public URL of the deployed site: NEXT_PUBLIC_SITE_URL, or on Vercel
 * the project's production domain, which Vercel provides itself. Returns null
 * when neither is available or the URL is a local address in a production
 * build, so canonical URLs, the sitemap and social previews are only emitted
 * for the real domain — never localhost or a guessed domain.
 */
export function getSiteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || vercelProductionUrl()
  if (!raw) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\]|.*\.local$)/.test(url.hostname)
  if (local && process.env.NODE_ENV === 'production') return null
  url.pathname = url.pathname.replace(/\/+$/, '') || '/'
  url.search = ''
  url.hash = ''
  return url
}

/**
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL (a host name) on every build: the
 * project's shortest custom domain, or its vercel.app address.
 */
function vercelProductionUrl(): string | undefined {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  return host ? `https://${host}` : undefined
}

/** Joins a site path onto the base URL, keeping any sub-folder (e.g. https://user.github.io/repo). */
export function absoluteUrl(base: URL, path: string): string {
  const root = base.href.endsWith('/') ? base.href : `${base.href}/`
  return new URL(path.replace(/^\/+/, ''), root).toString()
}
