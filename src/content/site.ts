/**
 * Site identity and public copy. Keep it short, personal and factual:
 * no invented credentials, release dates, stats or guarantees.
 */
export const site = {
  name: 'EEMS',
  title: 'EEMS — music, art & merch',
  description:
    'EEMS: music, artwork and merch. Press play on tracks from SoundCloud, shop the EEMS merch and explore the art.',
  tagline: 'Music. Visuals. Ideas. No Limits.',
  intro: 'Music, artwork and merch from EEMS. Welcome to my creative world.',
  annotation: 'Same brain. Different outlets.',
  /** Scroll-linked band under the hero (decorative). */
  marquee: ['Music', 'Merch', 'Art', 'Visuals', 'No limits'],
} as const

export const copy = {
  hero: {
    posterNote: 'wear the art',
    stickerHint: 'tap me',
  },
  merchFeature: {
    eyebrow: 'EEMS merch',
    heading: 'Merch',
    body: 'Tees, hoodies and sweatpants featuring EEMS artwork.',
    kinds: ['Tees', 'Hoodies', 'Sweatpants'],
    cta: 'Shop the merch',
    artworkLink: 'See the artwork up close',
    checkout: 'Secure checkout with Shopify.',
  },
  music: {
    eyebrow: 'Listen',
    heading: 'Music',
    body: [
      'EEMS is my artist name: music, plus the artwork that goes with it.',
      'Press play on a few tracks below — they stream straight from SoundCloud. A new album is on the way.',
    ],
    more: 'More on SoundCloud',
    followHeading: 'Follow',
  },
  art: {
    eyebrow: 'EEMS',
    heading: 'Art',
    body: 'Illustration, artwork and visuals from the EEMS world. Select any piece to see it larger.',
  },
  about: {
    eyebrow: 'About',
    heading: 'EEMS',
    body: [
      'I’m EEMS. I make music, and the art, visuals and merch that go with it.',
      'Same brain, different outlets: the songs, the artwork and the merch all feed into each other.',
    ],
    followHeading: 'Follow & say hi',
    followNote: 'For anything else, send me a message on Instagram or TikTok.',
  },
  footer: {
    tagline: 'Music. Visuals. Ideas. No Limits.',
  },
} as const
