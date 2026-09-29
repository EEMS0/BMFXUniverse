import { Squiggle } from '@/components/decor/Doodles'
import { PaperScrap, SectionTear } from '@/components/decor/Torn'
import { ArtImage } from '@/components/ui/ArtImage'
import { MailIcon, platformIcons } from '@/components/ui/Icons'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TiltSurface } from '@/components/ui/TiltSurface'
import { configuredSocialLinks, publicContactEmail } from '@/content/links'
import { copy, site } from '@/content/site'

/** Short and personal, plus the ways to follow and get in touch. Nothing invented. */
export function AboutSection() {
  const socials = configuredSocialLinks()
  return (
    <section id="about" aria-labelledby="about-title" className="section overflow-hidden bg-ink-950">
      <SectionTear seed={505} from="ink-900" />
      <div className="shell grid items-center gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div aria-hidden="true" className="reveal relative mx-auto aspect-[1.1] w-full max-w-[32rem]">
          <PaperScrap seed={57} tone="ink" depth={2.2} className="inset-0 -rotate-2" />
          <PaperScrap seed={63} tone="violet" depth={3} className="inset-[18%_-4%_-5%_40%] rotate-3 opacity-80" />
          <TiltSurface className="absolute inset-[6%] rounded-3xl" max={5}>
            <span className="relative block size-full">
              <ArtImage
                id="eemsCharacters"
                decorative
                fill
                sizes="(min-width: 768px) 36vw, 88vw"
                className="object-contain [filter:drop-shadow(0_18px_22px_rgb(0_0_0/0.7))]"
              />
            </span>
          </TiltSurface>
        </div>

        <div className="reveal">
          <SectionHeading id="about-title" eyebrow={copy.about.eyebrow} title={copy.about.heading} tone="yellow" note={site.annotation}>
            {copy.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </SectionHeading>
          <Squiggle aria-hidden="true" className="mt-6 w-32 text-violet/70" />

          {socials.length || publicContactEmail ? (
            <div className="mt-8">
              <h3 className="eyebrow mb-2">{copy.about.followHeading}</h3>
              <p className="text-haze">{copy.about.followNote}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {socials.map((link) => {
                  const Icon = platformIcons[link.platform]
                  return (
                    <li key={link.platform}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tilt spotlight group flex min-h-16 items-center gap-3 rounded-xl border border-white/10 bg-ink-850 px-4 py-3 transition-colors hover:border-acid/60"
                      >
                        <Icon className="size-6 shrink-0 text-acid" />
                        <span className="min-w-0">
                          <span className="block font-semibold text-paper">{link.label}</span>
                          {link.handle ? <span className="block truncate text-sm text-smoke">{link.handle}</span> : null}
                        </span>
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  )
                })}
                {publicContactEmail ? (
                  <li>
                    <a
                      href={`mailto:${publicContactEmail}`}
                      className="flex min-h-16 items-center gap-3 rounded-xl border border-white/10 bg-ink-850 px-4 py-3 hover:border-acid/60"
                    >
                      <MailIcon className="size-6 shrink-0 text-acid" />
                      <span className="truncate font-semibold text-paper">{publicContactEmail}</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
