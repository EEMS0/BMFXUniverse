import { describe, expect, it } from 'vitest'

import { artwork } from '@/content/artwork'
import { configuredSocialLinks, listenNowTarget, publicContactEmail, socialLinks } from '@/content/links'
import { merch } from '@/content/merch'
import { soundcloudApiUrl, soundcloudEmbedSrc, soundcloudProfileUrl, tracks } from '@/content/music'
import { MERCH_PATH, mainNav, navHref, sectionHref } from '@/content/navigation'
import { categoriesWithEntries, getPublicProject, projects, publicProjects } from '@/content/projects'
import { copy, site } from '@/content/site'
import type { ArtworkId } from '@/content/types'

describe('artwork registry', () => {
  it('describes every artwork and records its supplied source file', () => {
    for (const [id, art] of Object.entries(artwork)) {
      expect(art.alt.trim().length, id).toBeGreaterThan(3)
      expect(art.sourceFile, id).toMatch(/\.(png|PNG|gif)$/)
    }
  })

  it('uses the 12 supplied EEMS originals and none of the BMFX artwork', () => {
    const sources = new Set(Object.values(artwork).map((art) => art.sourceFile))
    expect(sources.size).toBe(12)
    expect(sources).not.toContain('BMFX-v3.png')
    expect(sources).not.toContain('bmbm.png')
  })
})

describe('projects', () => {
  it('only publishes entries with genuine artwork that exists in the registry', () => {
    for (const project of publicProjects) {
      expect(project.images.length, project.slug).toBeGreaterThan(0)
      for (const id of project.images) expect(artwork[id as ArtworkId], `${project.slug}:${id}`).toBeDefined()
      expect(project.label.trim(), project.slug).not.toBe('')
    }
  })

  it('has unique slugs and no BMFX entries', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs.some((slug) => slug.includes('bmfx'))).toBe(false)
  })

  it('keeps Baked & Broke hidden and out of the filters until approved content exists', () => {
    const baked = projects.find((project) => project.slug === 'baked-and-broke')
    expect(baked?.visibility).toBe('hidden')
    expect(getPublicProject('baked-and-broke')).toBeUndefined()
    expect(categoriesWithEntries()).not.toContain('games')
  })

  it('offers only categories that have entries', () => {
    for (const category of categoriesWithEntries()) {
      expect(publicProjects.some((project) => project.categories.includes(category))).toBe(true)
    }
  })

  it('does not present SYMPTOMS as the upcoming album', () => {
    const symptoms = getPublicProject('symptoms')
    expect(symptoms).toBeDefined()
    expect(JSON.stringify(symptoms)).not.toMatch(/upcoming|album/i)
  })
})

describe('links and availability flags', () => {
  it('never contains placeholder links', () => {
    for (const link of socialLinks) {
      if (link.url === null) continue
      expect(link.url, link.platform).toMatch(/^https:\/\/[^\s#]+$/)
    }
  })

  it('keeps unconfirmed destinations unset', () => {
    expect(socialLinks.find((link) => link.platform === 'spotify')?.url).toBeNull()
    expect(socialLinks.find((link) => link.platform === 'youtube')?.url).toBeNull()
    expect(publicContactEmail).toBeNull()
    expect(configuredSocialLinks().map((link) => link.platform)).toEqual(['instagram', 'tiktok', 'soundcloud'])
  })

  it('points "Listen now" at the Music section by default', () => {
    expect(listenNowTarget).toEqual({ type: 'section' })
  })
})

describe('SoundCloud tracks', () => {
  it('embeds finished tracks from the EEMS SoundCloud profile only', () => {
    expect(tracks.length).toBeGreaterThan(0)
    for (const track of tracks) {
      expect(track.url.startsWith(`${soundcloudProfileUrl}/`), track.title).toBe(true)
      expect(track.trackId, track.title).toMatch(/^\d+$/)
      expect(track.title, track.title).not.toMatch(/draft|test|snippet|demo/i)
    }
    expect(new Set(tracks.map((track) => track.trackId)).size).toBe(tracks.length)
  })

  it('builds the official player URL and never autoplays unless asked', () => {
    const track = tracks[0]
    const quiet = new URL(soundcloudEmbedSrc(track, { autoPlay: false }))
    expect(quiet.origin + quiet.pathname).toBe('https://w.soundcloud.com/player/')
    expect(quiet.searchParams.get('url')).toBe(soundcloudApiUrl(track))
    expect(quiet.searchParams.get('auto_play')).toBe('false')
    expect(quiet.searchParams.get('visual')).toBe('false')
    expect(new URL(soundcloudEmbedSrc(track, { autoPlay: true })).searchParams.get('auto_play')).toBe('true')
  })
})

describe('merch', () => {
  it('uses a public Storefront token for the store’s own myshopify domain', () => {
    expect(merch.shopify.domain).toMatch(/^[a-z0-9-]+\.myshopify\.com$/)
    // Buy Button tokens are 32 hex characters; Admin API tokens start with "shpat_".
    expect(merch.shopify.storefrontAccessToken).toMatch(/^[0-9a-f]{32}$/)
    expect(merch.shopify.collectionId).toMatch(/^\d+$/)
    expect(merch.shopify.sdkUrl).toMatch(/^https:\/\/sdks\.shopifycdn\.com\//)
    expect(decodeURIComponent(merch.shopify.moneyFormat)).toBe('£{{amount}}')
  })

  it('shows the supplied merch artwork', () => {
    expect(artwork[merch.artwork].sourceFile).toBe('BACK-MERCH.png')
  })
})

describe('navigation and copy', () => {
  it('is EEMS-only with Merch as its own page', () => {
    expect(mainNav.map((item) => item.label)).toEqual(['Home', 'Music', 'Merch', 'Art', 'About'])
    expect(mainNav.find((item) => item.label === 'Merch')?.page).toBe(MERCH_PATH)
    expect(navHref(mainNav[1])).toBe(sectionHref('music'))
    expect(navHref(mainNav[2])).toBe('/merch')
  })

  it('never mentions BMFX, hiring or enquiries', () => {
    const text = JSON.stringify({ site, copy, mainNav, merch })
    expect(text).not.toMatch(/bmfx|hire me|enquir/i)
  })
})
