import { pageHref, withBase } from '@/lib/paths'
import type { NavItem } from './types'

/** Main navigation. Merch is its own page; everything else is a section of the home page. */
export const mainNav: NavItem[] = [
  { label: 'Home', section: 'home' },
  { label: 'Music', section: 'music' },
  { label: 'Merch', page: '/merch' },
  { label: 'Art', section: 'art' },
  { label: 'About', section: 'about' },
]

/** Link to a home-page section for plain <a> elements (includes any base path). */
export const sectionHref = (section: string) => withBase(`/#${section}`)

/** Href for a nav item (section or separate page). */
export const navHref = (item: NavItem) => (item.page ? pageHref(item.page) : sectionHref(item.section ?? 'home'))

/** The merch page, used by every "Shop merch" call to action. */
export const MERCH_PATH = '/merch'
export const merchHref = () => pageHref(MERCH_PATH)
