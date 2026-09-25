import { copy, site } from '@/content/site'
import { configuredSocialLinks, publicContactEmail } from '@/content/links'
import { mainNav, sectionHref } from '@/content/navigation'
import { ArtImage } from '@/components/ui/ArtImage'
import { MailIcon, platformIcons } from '@/components/ui/Icons'
import { CurrentYear } from './CurrentYear'

export function SiteFooter() {
  const socials = configuredSocialLinks()
  return (
    <footer className="relative border-t border-white/[0.08] bg-ink-950">
      <div className="shell grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-start lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-16">
        <div>
          <a href={sectionHref('home')} className="-ml-3 inline-block rounded-md" aria-label="EEMS — back to top">
            <ArtImage id="eemsWordmark" decorative sizes="160px" className="h-auto w-40" />
          </a>
          <p className="mt-1 max-w-xs text-sm text-smoke">{copy.footer.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-3">Explore</p>
          <ul className="grid grid-cols-2 gap-x-8 text-sm sm:grid-cols-3 lg:grid-cols-2">
            {mainNav.map((item) => (
              <li key={item.section}>
                <a href={sectionHref(item.section)} className="inline-flex min-h-11 items-center text-haze uppercase tracking-nav hover:text-acid">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {socials.length || publicContactEmail ? (
          <div>
            <p className="eyebrow mb-3">Elsewhere</p>
            <ul className="flex flex-col text-sm">
              {socials.map((link) => {
                const Icon = platformIcons[link.platform]
                return (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-3 text-haze hover:text-acid"
                    >
                      <Icon className="size-5" />
                      <span>
                        {link.label}
                        {link.handle ? <span className="text-smoke"> {link.handle}</span> : null}
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                )
              })}
              {publicContactEmail ? (
                <li>
                  <a href={`mailto:${publicContactEmail}`} className="inline-flex min-h-11 items-center gap-3 text-haze hover:text-acid">
                    <MailIcon className="size-5" />
                    {publicContactEmail}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear fallback={new Date().getFullYear()} /> {site.name}. All rights reserved.
          </p>
          <p>BMFX is the GFX/VFX side of {site.name}.</p>
        </div>
      </div>
    </footer>
  )
}
