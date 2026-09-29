import { afterEach, describe, expect, it, vi } from 'vitest'

import { absoluteUrl, getSiteUrl } from '@/lib/site-url'
import staticImageLoader from '@/lib/static-image-loader'
import { tornPolygon } from '@/lib/torn'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('getSiteUrl', () => {
  it('is null until a site URL is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    expect(getSiteUrl()).toBeNull()
  })

  it('never returns a local address in production builds', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
    expect(getSiteUrl()).toBeNull()
  })

  it('normalises a real URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/')
    expect(getSiteUrl()?.href).toBe('https://example.com/')
  })

  it('uses the production domain Vercel provides when no URL is set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'bmfx-universe.vercel.app')
    expect(getSiteUrl()?.href).toBe('https://bmfx-universe.vercel.app/')
  })

  it('prefers an explicit site URL over the Vercel domain', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'bmfx-universe.vercel.app')
    expect(getSiteUrl()?.href).toBe('https://example.com/')
  })
})

describe('absoluteUrl', () => {
  it('keeps sub-folder deployments intact', () => {
    expect(absoluteUrl(new URL('https://user.github.io/repo'), '/work/symptoms')).toBe('https://user.github.io/repo/work/symptoms')
    expect(absoluteUrl(new URL('https://example.com'), '/sitemap.xml')).toBe('https://example.com/sitemap.xml')
  })
})

describe('page links', () => {
  it('are plain paths on Vercel', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_TARGET', '')
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '')
    const { pageHref, workHref } = await import('@/lib/paths')
    expect(pageHref('/merch')).toBe('/merch')
    expect(pageHref('/')).toBe('/')
    expect(workHref('symptoms')).toBe('/work/symptoms')
  })

  it('get the base path and a trailing slash in a static export', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_TARGET', 'static')
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/repo/')
    const { pageHref, workHref, withBase } = await import('@/lib/paths')
    expect(pageHref('/merch')).toBe('/repo/merch/')
    expect(pageHref('/')).toBe('/repo/')
    expect(workHref('symptoms')).toBe('/repo/work/symptoms/')
    expect(withBase('/#music')).toBe('/repo/#music')
    expect(withBase('https://soundcloud.com/eems420')).toBe('https://soundcloud.com/eems420')
  })
})

describe('staticImageLoader (static export)', () => {
  it('maps a static import to the nearest pre-rendered width', () => {
    expect(staticImageLoader({ src: '/_next/static/media/eems-portrait.12b8gz-zzg070.webp', width: 700 })).toBe('/art-sizes/eems-portrait-960.webp')
    expect(staticImageLoader({ src: '/repo/_next/static/media/merch-artwork.2-_s8gyx.webp', width: 96 })).toBe('/art-sizes/merch-artwork-96.webp')
    expect(staticImageLoader({ src: '/_next/static/media/swag-bag.abc.webp', width: 4000 })).toBe('/art-sizes/swag-bag-1920.webp')
  })

  it('leaves other sources untouched', () => {
    expect(staticImageLoader({ src: '/og-image.jpg', width: 640 })).toBe('/og-image.jpg')
  })
})

describe('tornPolygon', () => {
  it('is deterministic so server and browser render the same outline', () => {
    expect(tornPolygon(21)).toBe(tornPolygon(21))
    expect(tornPolygon(21)).not.toBe(tornPolygon(22))
    expect(tornPolygon(5, { edges: ['bottom'], steps: 4 })).toMatch(/^polygon\(.+\)$/)
  })
})
