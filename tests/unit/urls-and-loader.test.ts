import { afterEach, describe, expect, it, vi } from 'vitest'

import { absoluteUrl, getSiteUrl } from '@/lib/site-url'
import staticImageLoader from '@/lib/static-image-loader'
import { serviceFromSearch } from '@/lib/enquiry/intent'
import { tornPolygon } from '@/lib/torn'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getSiteUrl', () => {
  it('is null until a site URL is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
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
})

describe('absoluteUrl', () => {
  it('keeps sub-folder deployments intact', () => {
    expect(absoluteUrl(new URL('https://user.github.io/repo'), '/work/symptoms')).toBe('https://user.github.io/repo/work/symptoms')
    expect(absoluteUrl(new URL('https://example.com'), '/sitemap.xml')).toBe('https://example.com/sitemap.xml')
  })
})

describe('staticImageLoader (GitHub Pages preview)', () => {
  it('maps a static import to the nearest pre-rendered width', () => {
    expect(staticImageLoader({ src: '/_next/static/media/eems-portrait.12b8gz-zzg070.webp', width: 700 })).toBe('/art-sizes/eems-portrait-960.webp')
    expect(staticImageLoader({ src: '/repo/_next/static/media/bmfx-crt.2-_s8gyx.webp', width: 96 })).toBe('/art-sizes/bmfx-crt-96.webp')
    expect(staticImageLoader({ src: '/_next/static/media/swag-bag.abc.webp', width: 4000 })).toBe('/art-sizes/swag-bag-1920.webp')
  })

  it('leaves other sources untouched', () => {
    expect(staticImageLoader({ src: '/og-image.jpg', width: 640 })).toBe('/og-image.jpg')
  })
})

describe('serviceFromSearch', () => {
  it('only accepts known service ids', () => {
    expect(serviceFromSearch('?service=video-editing')).toBe('video-editing')
    expect(serviceFromSearch('?service=<script>')).toBeNull()
    expect(serviceFromSearch('')).toBeNull()
  })
})

describe('tornPolygon', () => {
  it('is deterministic so server and browser render the same outline', () => {
    expect(tornPolygon(21)).toBe(tornPolygon(21))
    expect(tornPolygon(21)).not.toBe(tornPolygon(22))
    expect(tornPolygon(5, { edges: ['bottom'], steps: 4 })).toMatch(/^polygon\(.+\)$/)
  })
})
