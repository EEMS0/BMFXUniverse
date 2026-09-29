/**
 * Art gallery entries. Every public entry must use genuine supplied artwork and
 * only confirmed facts — no invented briefs, clients, tools, dates or results.
 *
 * Adding work: add the artwork to artwork.ts, then add an entry here.
 * Future games and experiments use the 'games' / 'experiments' categories; a
 * category only appears in the gallery filters once it has a public entry.
 */
import type { Project, ProjectCategory, PublicProject } from './types'

export const projects: Project[] = [
  {
    slug: 'eems-merch-artwork',
    visibility: 'public',
    title: 'EEMS merch artwork',
    label: 'Psychedelic illustration for merchandise',
    context: 'Artwork for merchandise connected to the upcoming EEMS album.',
    categories: ['merch-artwork', 'illustration'],
    images: ['merchArtwork'],
  },
  {
    slug: 'swag-bag',
    visibility: 'public',
    title: 'SWAG BAG',
    label: 'Automotive artwork with chrome lettering',
    categories: ['visuals', 'design'],
    images: ['swagBag'],
  },
  {
    slug: 'eems-glow',
    visibility: 'public',
    title: 'EEMS',
    label: 'Atmospheric artwork with glowing lettering',
    categories: ['visuals'],
    images: ['eemsAtmosphere'],
  },
  {
    slug: 'pink-haired-character',
    visibility: 'public',
    title: 'Pink-haired character',
    label: 'Character illustration',
    categories: ['illustration'],
    images: ['characterPortrait'],
  },
  {
    slug: 'symptoms',
    visibility: 'public',
    title: 'SYMPTOMS',
    label: 'Music artwork',
    categories: ['music-artwork', 'design'],
    images: ['symptoms'],
  },
  {
    slug: 'eemsojis',
    visibility: 'public',
    title: 'Eemsojis',
    label: 'Set of four character expressions',
    categories: ['illustration'],
    images: ['eemojiSmirk', 'eemojiAnnoyed', 'eemojiWorried', 'eemojiGrin'],
  },
  {
    slug: 'eems-characters',
    visibility: 'public',
    title: 'EEMS characters',
    label: 'Bubble-letter EEMS with animal characters',
    categories: ['illustration'],
    images: ['eemsCharacters'],
  },
  {
    slug: 'eems-wordmark',
    visibility: 'public',
    title: 'EEMS wordmark',
    label: 'Yellow lettering with a blue and orange glow',
    categories: ['design'],
    images: ['eemsWordmark'],
  },
  {
    slug: 'eems-portrait',
    visibility: 'public',
    title: 'EEMS portrait',
    label: 'Edited portrait with red and blue light',
    categories: ['visuals'],
    images: ['eemsPortrait'],
  },
  {
    slug: 'baked-and-broke',
    visibility: 'hidden',
    title: 'Baked & Broke',
    categories: ['games'],
    note: 'Game in development. Keep hidden until approved screenshots or media are supplied; do not invent release details.',
  },
]

export const categoryLabels: Record<ProjectCategory, string> = {
  design: 'Design',
  visuals: 'Visuals',
  illustration: 'Illustration',
  'music-artwork': 'Music artwork',
  'merch-artwork': 'Merch artwork',
  games: 'Games',
  experiments: 'Experiments',
}

const categoryOrder: ProjectCategory[] = [
  'design',
  'visuals',
  'illustration',
  'music-artwork',
  'merch-artwork',
  'games',
  'experiments',
]

export const publicProjects: PublicProject[] = projects.filter(
  (project): project is PublicProject => project.visibility === 'public',
)

export function getPublicProject(slug: string): PublicProject | undefined {
  return publicProjects.find((project) => project.slug === slug)
}

/** Categories that currently have at least one public entry, in display order. */
export function categoriesWithEntries(list: PublicProject[] = publicProjects): ProjectCategory[] {
  return categoryOrder.filter((category) => list.some((project) => project.categories.includes(category)))
}
