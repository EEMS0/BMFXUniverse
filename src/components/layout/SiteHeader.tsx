'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { ENQUIRY_SECTION, mainNav, sectionHref } from '@/content/navigation'
import { configuredSocialLinks } from '@/content/links'
import { ArtImage } from '@/components/ui/ArtImage'
import { buttonClasses } from '@/components/ui/Button'
import { CloseIcon, MenuIcon, platformIcons } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { focusSection } from '@/lib/focus-section'

/** Tracks which home-page section is under the reading line. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(enabled ? 'home' : null)
  useEffect(() => {
    if (!enabled) return
    const sections = mainNav
      .map((item) => document.getElementById(item.section))
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
  const active = useActiveSection(onHome)
  const menuRef = useRef<HTMLDialogElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const socials = configuredSocialLinks()

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

  /** Leaving the menu through a section link: close it and continue from that section. */
  const navigateFromMenu = (section: string) => {
    returnFocus.current = false
    menuRef.current?.close()
    if (onHome) focusSection(section)
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
              const current = active === item.section
              return (
                <li key={item.section}>
                  <a
                    href={sectionHref(item.section)}
                    aria-current={current ? 'true' : undefined}
                    className={cn(
                      'relative inline-flex min-h-11 items-center px-2.5 text-[0.75rem] font-semibold tracking-nav whitespace-nowrap uppercase transition-colors',
                      'after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-0.5 after:rounded-full after:transition-transform after:duration-300',
                      current ? 'text-acid after:scale-x-100 after:bg-acid' : 'text-haze after:scale-x-0 after:bg-acid hover:text-paper',
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
          <a href={sectionHref(ENQUIRY_SECTION)} className={buttonClasses('outline-acid', 'sm', 'hidden px-5 sm:inline-flex')}>
            Get a quote
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
              {mainNav.map((item) => (
                <li key={item.section}>
                  <a
                    href={sectionHref(item.section)}
                    onClick={() => navigateFromMenu(item.section)}
                    aria-current={active === item.section ? 'true' : undefined}
                    className={cn(
                      'flex min-h-14 items-center justify-between font-marker text-[1.7rem] transition-colors',
                      active === item.section ? 'text-acid' : 'text-paper hover:text-acid',
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="shell mt-8 flex flex-col gap-6 pb-10">
            <a
              href={sectionHref(ENQUIRY_SECTION)}
              onClick={() => navigateFromMenu(ENQUIRY_SECTION)}
              className={buttonClasses('acid', 'md', 'self-start')}
            >
              Get a quote
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
