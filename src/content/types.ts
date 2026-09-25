import type { StaticImageData } from 'next/image'

/** Keys of the artwork registry in `artwork.ts`. */
export type ArtworkId =
  | 'eemsWordmark'
  | 'eemsPortrait'
  | 'bmfxCrt'
  | 'bmfxLogo'
  | 'merchArtwork'
  | 'eemsCharacters'
  | 'swagBag'
  | 'eemsAtmosphere'
  | 'symptoms'
  | 'eemojiSmirk'
  | 'eemojiAnnoyed'
  | 'eemojiWorried'
  | 'eemojiGrin'
  | 'characterPortrait'

export interface Artwork {
  src: StaticImageData
  /** Accurate description of the artwork for screen readers. */
  alt: string
  /** Supplied original filename (provenance; see src/assets/art/derivatives.json). */
  sourceFile: string
  /** CSS object-position used when the artwork is cropped into a fixed frame. */
  focal?: string
  /** The artwork has real transparency: show it whole on a matte instead of cropping it. */
  transparent?: boolean
}

export type ProjectCategory =
  | 'design'
  | 'visuals'
  | 'illustration'
  | 'music-artwork'
  | 'merch-artwork'
  | 'games'
  | 'experiments'

interface ProjectBase {
  /** URL slug for /work/[slug]. */
  slug: string
  title: string
  categories: ProjectCategory[]
}

/** A project that is published on the site. Only confirmed facts belong here. */
export interface PublicProject extends ProjectBase {
  visibility: 'public'
  /** Neutral, accurate description of what the artwork is. */
  label: string
  /** One or more artworks; the first is the cover. */
  images: [ArtworkId, ...ArtworkId[]]
  /** Optional confirmed context (never invented briefs, clients, tools or results). */
  context?: string
}

/** Work that exists but must not be shown until approved content is supplied. */
export interface HiddenProject extends ProjectBase {
  visibility: 'hidden'
  /** Internal note for whoever edits the content. Never rendered. */
  note: string
  images?: ArtworkId[]
}

export type Project = PublicProject | HiddenProject

export interface FeaturedItem {
  slug: string
  /** Short caption shown under the tile. */
  title: string
  meta: string
}

export type ServiceId = 'graphic-design' | 'motion-graphics' | 'video-editing' | 'visual-effects'

export interface Service {
  id: ServiceId
  name: string
  summary: string
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'soundcloud' | 'spotify' | 'youtube'

export interface SocialLink {
  platform: SocialPlatform
  label: string
  /** Public handle shown next to the link, when known. */
  handle?: string
  /** `null` means "not confirmed yet": the link is hidden everywhere. */
  url: string | null
  /** Whether this destination is a place to listen to the music. */
  listen: boolean
}

export interface NavItem {
  label: string
  /** Section id on the home page. */
  section: string
}

/** Optional playable media. Nothing renders unless a real file or embed is configured. */
export interface Track {
  title: string
  artwork?: ArtworkId
  /** Self-hosted audio file, e.g. "/audio/track.mp3" placed in /public/audio. */
  audio?: { src: string; type: 'audio/mpeg' | 'audio/ogg' | 'audio/wav' | 'audio/aac' }
  /** Embeddable player URL from the platform's official "embed" option. */
  embed?: { provider: 'soundcloud' | 'spotify' | 'youtube'; src: string; height: number }
}
