/**
 * Public destinations. A `null` url means the destination has not been
 * confirmed: every link, icon and button that depends on it stays hidden.
 * Never put placeholder or guessed accounts here.
 */
import type { SocialLink, SocialPlatform } from './types'

export const socialLinks: SocialLink[] = [
  {
    platform: 'instagram',
    label: 'Instagram',
    handle: '@eems420',
    url: 'https://www.instagram.com/eems420/',
    listen: false,
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    handle: '@eems.co',
    url: 'https://www.tiktok.com/@eems.co',
    listen: false,
  },
  {
    platform: 'soundcloud',
    label: 'SoundCloud',
    handle: 'eems420',
    // Supplied as https://on.soundcloud.com/fMKE5fOXzDaqj7BSe1, which redirects to
    // this profile. The clean profile URL avoids the share-tracking parameters.
    url: 'https://soundcloud.com/eems420',
    listen: true,
  },
  // Not confirmed yet — set the full URL to publish the link.
  { platform: 'spotify', label: 'Spotify', url: null, listen: true },
  { platform: 'youtube', label: 'YouTube', url: null, listen: true },
]

/** Public contact email. When set, the enquiry form offers a clearly labelled mailto fallback. */
export const publicContactEmail: string | null = null

/** Merchandise shop. When set, the Art & merch section links to it. */
export const merchShopUrl: string | null = null

/**
 * Where "Listen now" in the hero goes. Defaults to the Music section; set to a
 * configured platform (e.g. 'soundcloud') to link straight out instead.
 */
export const listenNowTarget: { type: 'section' } | { type: 'platform'; platform: SocialPlatform } = {
  type: 'section',
}

export type ConfiguredSocialLink = SocialLink & { url: string }

/** Links that have a confirmed URL, in display order. */
export function configuredSocialLinks(filter?: (link: SocialLink) => boolean): ConfiguredSocialLink[] {
  return socialLinks.filter((link): link is ConfiguredSocialLink => Boolean(link.url) && (!filter || filter(link)))
}
