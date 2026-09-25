import { ContactForm } from '@/components/contact/ContactForm'
import { SwoopArrow } from '@/components/decor/Doodles'
import { PaperScrap, SectionTear } from '@/components/decor/Torn'
import { platformIcons } from '@/components/ui/Icons'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { configuredSocialLinks } from '@/content/links'
import { ENQUIRY_SECTION } from '@/content/navigation'
import { services } from '@/content/services'
import { copy } from '@/content/site'

/** "Hire me": the enquiry form (the main conversion) with a short intro. */
export function ContactSection() {
  const socials = configuredSocialLinks((link) => link.platform === 'instagram' || link.platform === 'tiktok')
  return (
    <section id={ENQUIRY_SECTION} aria-labelledby="hire-me-title" className="section overflow-hidden bg-ink-950">
      <SectionTear seed={606} from="ink-900" />
      <PaperScrap seed={77} tone="violet" depth={2.4} className="bottom-[3%] left-[-9%] h-[24%] w-[26%] rotate-6 opacity-50 max-lg:hidden" />
      <div className="shell relative grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="reveal lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
          <SectionHeading id="hire-me-title" eyebrow={copy.contact.eyebrow} title={copy.contact.heading} tone="acid">
            <p>{copy.contact.body}</p>
          </SectionHeading>
          <ul className="mt-7 space-y-2 text-haze" aria-label="Services">
            {services.map((service) => (
              <li key={service.id} className="flex items-center gap-3">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-acid" />
                {service.name}
              </li>
            ))}
          </ul>
          {socials.length ? (
            <div className="mt-9">
              <p className="font-hand flex items-center gap-2 text-2xl text-lilac">
                {copy.contact.socialPrompt}
                <SwoopArrow aria-hidden="true" className="w-10 rotate-12 text-violet" />
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
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
                        {link.handle ? <span className="text-smoke">{link.handle}</span> : null}
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="reveal">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
