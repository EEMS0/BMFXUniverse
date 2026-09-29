'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { configuredSocialLinks } from '@/content/links'
import { mainNav, merchHref, MERCH_PATH, navHref, sectionHref } from '@/content/navigation'
import type { NavItem } from '@/content/types'
import { ArtImage } from '@/components/ui/ArtImage'
import { buttonClasses } from '@/components/ui/Button'
import { BagIcon, CloseIcon, MenuIcon, platformIcons } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { focusSection } from '@/lib/focus-section'

const navKey = (item: NavItem) => item.page ?? item.section ?? item.label

/** Tracks which home-page section is under the reading line. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(enabled ? 'home' : null)
  useEffect(() => {
    if (!enabled) return
    const sections = mainNav
      .map((item) => (item.section ? document.getElementById(item.section) : null))
      .filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-38% 0px -58% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [enabled])
  return enabled ? active : null
}

export function SiteHeader() {
  const pathname = usePathname()
  const onHome = pathname === '/'
  const onMerch = pathname === MERCH_PATH || pathname === `${MERCH_PATH}/`
  const activeSection = useActiveSection(onHome)
  const menuRef = useRef<HTMLDialogElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const socials = configuredSocialLinks()

  const isCurrent = (item: NavItem) => (item.page ? onMerch && item.page === MERCH_PATH : activeSection === item.section)

  const openMenu = () => {
    returnFocus.current = true
    menuRef.current?.showModal()
    closeButtonRef.current?.focus()
    setMenuOpen(true)
  }

  const onMenuClose = () => {
    setMenuOpen(false)
    if (returnFocus.current) menuButtonRef.current?.focus()
  }

  /** Leaving the menu through a link: close it and, for sections on this page, continue from there. */
  const navigateFromMenu = (item: NavItem) => {
    returnFocus.current = false
    menuRef.current?.close()
    if (onHome && item.section) focusSection(item.section)
  }

  // The menu is for small screens; close it if the viewport grows past the breakpoint.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 64rem)')
    const onChange = () => {
      if (query.matches && menuRef.current?.open) menuRef.current.close()
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#08070bf2]">
      <div className="shell flex h-(--header-height) items-center gap-4">
        <a href={sectionHref('home')} className="-ml-3 flex shrink-0 items-center self-stretch rounded-md" aria-label="EEMS — home">
          <ArtImage id="eemsWordmark" decorative sizes="126px" loading="eager" className="h-auto w-[6.9rem] lg:w-[7.8rem]" />
        </a>

        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-3">
            {mainNav.map((item) => {
              const current = isCurrent(item)
              return (
                <li key={navKey(item)}>
                  <a
                    href={navHref(item)}
                    aria-current={current ? (item.page ? 'page' : 'true') : undefined}
                    className={cn(
                      'relative inline-flex min-h-11 items-center px-3 text-[0.8125rem] font-semibold tracking-nav whitespace-nowrap uppercase transition-colors',
                      'after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:transition-transform after:duration-300',
                      current ? 'text-acid after:scale-x-100 after:bg-acid' : 'text-haze after:scale-x-0 after:bg-acid hover:text-paper hover:after:scale-x-100',
                      item.page && !current && 'text-pink',
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a href={merchHref()} className={buttonClasses('acid', 'sm', 'gap-2 px-4 max-[379px]:hidden')}>
            <BagIcon className="size-4" />
            Shop merch
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="grid size-11 place-items-center rounded-full border border-white/15 text-paper transition hover:border-acid hover:text-acid lg:hidden"
          >
            <MenuIcon className="size-5" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      <dialog
        id="site-menu"
        ref={menuRef}
        aria-label="Menu"
        onClose={onMenuClose}
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-ink-950 p-0 text-paper backdrop:bg-ink-950/80"
      >
        <div className="grain flex min-h-full flex-col">
          <div className="shell flex h-(--header-height) items-center justify-between">
            <ArtImage id="eemsWordmark" decorative sizes="126px" className="-ml-3 h-auto w-[6.9rem]" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => menuRef.current?.close()}
              className="grid size-11 place-items-center rounded-full border border-white/15 transition hover:border-acid hover:text-acid"
            >
              <CloseIcon className="size-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav aria-label="Main" className="shell mt-4">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {mainNav.map((item) => {
                const current = isCurrent(item)
                return (
                  <li key={navKey(item)}>
                    <a
                      href={navHref(item)}
                      onClick={() => navigateFromMenu(item)}
                      aria-current={current ? (item.page ? 'page' : 'true') : undefined}
                      className={cn(
                        'flex min-h-14 items-center justify-between font-marker text-[1.8rem] transition-colors',
                        current ? 'text-acid' : item.page ? 'text-pink hover:text-acid' : 'text-paper hover:text-acid',
                      )}
                    >
                      {item.label}
                      {item.page ? <BagIcon className="size-6" /> : null}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="shell mt-8 flex flex-col gap-6 pb-10">
            <a href={merchHref()} className={buttonClasses('acid', 'md', 'self-start')}>
              <BagIcon className="size-5" />
              Shop merch
            </a>
            {socials.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="EEMS elsewhere">
                {socials.map((link) => {
                  const Icon = platformIcons[link.platform]
                  return (
                    <li key={link.platform}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-haze transition hover:border-acid hover:text-paper"
                      >
                        <Icon className="size-4" />
                        {link.label}
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </dialog>
    </header>
  )
}
