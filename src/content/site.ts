/**
 * Site identity and public copy. Keep it short, personal and factual:
 * no invented credentials, clients, release dates, stats or guarantees.
 */
export const site = {
  name: 'EEMS',
  studio: 'BMFX',
  title: 'EEMS — music, visuals and BMFX design & video',
  description:
    'EEMS makes music and artwork. BMFX is the GFX/VFX side: graphic design, motion graphics, video editing and visual effects. Explore the work or send a project enquiry.',
  tagline: 'Music. Visuals. Ideas. No Limits.',
  intro: 'Music through EEMS. Design and video through BMFX. Welcome to my creative world.',
  annotation: 'Same brain. Different outlets.',
  crtAnnotation: 'Visuals that hit different',
  bmfxDescriptor: ['GFX / VFX', 'Motion', 'Editing', 'Design'],
} as const

export const copy = {
  panels: {
    music: {
      heading: 'Music',
      body: 'The EEMS side of things: the sound, plus the artwork that goes with it.',
      cta: 'Explore music',
    },
    bmfx: {
      heading: 'BMFX',
      body: 'Need visuals that hit different? BMFX takes on graphic design, motion graphics, video editing and visual effects.',
      cta: 'Hire me',
    },
  },
  music: {
    eyebrow: 'EEMS',
    heading: 'Music',
    body: [
      'EEMS is my artist name: music, plus the artwork that goes with it.',
      'A new album is on the way. Artwork for merch connected to it is in the Art section.',
    ],
    listenHeading: 'Listen & follow',
  },
  bmfx: {
    eyebrow: 'GFX / VFX company',
    heading: 'BMFX',
    descriptor: 'GFX / VFX / Design / Video',
    body: 'BMFX is my GFX/VFX company for design and video work. Pick the kind of work you need and tell me about the project.',
    workHeading: 'Selected visuals',
  },
  art: {
    eyebrow: 'EEMS',
    heading: 'Art & merch',
    body: 'Illustration and character art from the EEMS world, including artwork for merchandise connected to the upcoming album.',
    merchCaption: 'Merch artwork for the upcoming album',
  },
  projects: {
    heading: 'Projects',
    body: 'Design, visuals, illustration and artwork. Select any piece to see it larger.',
  },
  about: {
    heading: 'EEMS & BMFX',
    body: [
      'I’m EEMS. I make music under that name, and I run BMFX, my GFX/VFX company, for design and video work.',
      'Two sides of the same brain: the music, the artwork and the visuals all feed into each other.',
    ],
  },
  contact: {
    eyebrow: 'BMFX enquiries',
    heading: 'Hire me',
    body: 'Tell me about your project: graphic design, motion graphics, video editing or visual effects. Budget and deadline are optional, so share whatever you know so far.',
    socialPrompt: 'Prefer to message first?',
  },
  footer: {
    tagline: 'Music through EEMS. Design and video through BMFX.',
  },
} as const
