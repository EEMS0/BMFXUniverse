import { describe, expect, it } from 'vitest'

import { artwork } from '@/content/artwork'
import { configuredSocialLinks, listenNowTarget, merchShopUrl, publicContactEmail, socialLinks } from '@/content/links'
import { playableTracks, tracks } from '@/content/music'
import { mainNav } from '@/content/navigation'
import { categoriesWithEntries, featuredWork, getPublicProject, projects, publicProjects } from '@/content/projects'
import { enquiryServiceIds, services } from '@/content/services'
import type { ArtworkId } from '@/content/types'
import { withBase } from '@/lib/paths'

describe('artwork registry', () => {
  it('describes every artwork and records its supplied source file', () => {
    for (const [id, art] of Object.entries(artwork)) {
      expect(art.alt.trim().length, id).toBeGreaterThan(3)
      expect(art.sourceFile, id).toMatch(/\.(png|PNG|gif)$/)
    }
  })

  it('covers all 14 supplied originals', () => {
    const sources = new Set(Object.values(artwork).map((art) => art.sourceFile))
    expect(sources.size).toBe(14)
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

  it('has unique slugs', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
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

  it('features six public projects under the hero', () => {
    expect(featuredWork).toHaveLength(6)
    for (const item of featuredWork) expect(getPublicProject(item.slug), item.slug).toBeDefined()
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

  it('links merchandise to the shop on this website', () => {
    expect(merchShopUrl).toBe(withBase('/merch.html'))
  })

  it('points "Listen now" at the Music section by default', () => {
    expect(listenNowTarget).toEqual({ type: 'section' })
  })
})

describe('music', () => {
  it('has no playable media until a real file or embed is configured', () => {
    expect(tracks).toEqual([])
    expect(playableTracks()).toEqual([])
  })

  it('only treats tracks with a source as playable', () => {
    expect(
      playableTracks([
        { title: 'No source' },
        { title: 'File', audio: { src: '/audio/a.mp3', type: 'audio/mpeg' } },
        { title: 'Embed', embed: { provider: 'soundcloud', src: 'https://w.soundcloud.com/player/?url=x', height: 166 } },
      ]).map((track) => track.title),
    ).toEqual(['File', 'Embed'])
  })
})

describe('navigation and services', () => {
  it('keeps the reference navigation labels', () => {
    expect(mainNav.map((item) => item.label.toUpperCase())).toEqual(['HOME', 'MUSIC', 'GFX / VFX (BMFX)', 'ART', 'PROJECTS', 'ABOUT', 'HIRE ME'])
  })

  it('shares service ids between the BMFX section and the enquiry form', () => {
    const ids = services.map((service) => service.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(enquiryServiceIds).toContain(id)
    expect(enquiryServiceIds).toContain('other')
  })
})
