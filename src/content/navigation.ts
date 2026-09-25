import { withBase } from '@/lib/paths'
import type { NavItem } from './types'

/** Main navigation. Labels match the design reference; each points at a real section. */
export const mainNav: NavItem[] = [
  { label: 'Home', section: 'home' },
  { label: 'Music', section: 'music' },
  { label: 'GFX / VFX (BMFX)', section: 'bmfx' },
  { label: 'Art', section: 'art' },
  { label: 'Projects', section: 'projects' },
  { label: 'About', section: 'about' },
  { label: 'Hire me', section: 'hire-me' },
]

/** Section that "Get a quote", "Hire me" and service enquiries lead to. */
export const ENQUIRY_SECTION = 'hire-me'

/** Link to a home-page section for plain <a> elements (includes any base path). */
export const sectionHref = (section: string) => withBase(`/#${section}`)
