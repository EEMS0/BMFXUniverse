import { ServiceEnquiryLink } from '@/components/contact/ServiceEnquiryLink'
import { SectionTear } from '@/components/decor/Torn'
import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'
import { WorkCard } from '@/components/work/WorkCard'
import { ENQUIRY_SECTION, sectionHref } from '@/content/navigation'
import { services } from '@/content/services'
import { copy } from '@/content/site'

const selectedVisuals = ['swag-bag', 'eems-glow', 'eems-portrait']

/** BMFX: the GFX/VFX company. Green/orange, dark surfaces, CRT/3D imagery. */
export function BmfxSection() {
  return (
    <section id="bmfx" aria-labelledby="bmfx-title" className="section overflow-hidden bg-ink-950">
      <SectionTear seed={202} from="ink-900" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_20%,rgb(61_122_32/0.22),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgb(255_138_61/0.08),transparent_70%)]" />
      <div className="shell relative grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div className="reveal">
          <p className="eyebrow">{copy.bmfx.eyebrow}</p>
          <h2 id="bmfx-title" className="mt-3 w-[min(70%,17rem)]">
            <ArtImage id="bmfxLogo" alt="BMFX" sizes="272px" className="h-auto w-full [filter:drop-shadow(0_10px_24px_rgb(157_251_88/0.18))]" />
          </h2>
          <p className="font-hand mt-2 -rotate-1 text-[1.9rem] leading-tight text-acid">{copy.bmfx.descriptor}</p>
          <p className="mt-4 max-w-xl text-lg text-haze">{copy.bmfx.body}</p>

          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {services.map((service, index) => (
              <li key={service.id} className="flex flex-col rounded-xl border border-white/10 bg-ink-850 p-5 transition-colors hover:border-acid/40">
                <span aria-hidden="true" className="font-marker text-2xl leading-none text-orbit">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-paper">{service.name}</h3>
                <p className="mt-1 mb-3 text-[0.95rem] text-haze">{service.summary}</p>
                <ServiceEnquiryLink service={service.id} name={service.name} className="mt-auto" />
              </li>
            ))}
          </ul>

          <ButtonLink href={sectionHref(ENQUIRY_SECTION)} variant="acid" className="mt-9">
            Get a quote
          </ButtonLink>
        </div>

        <div className="reveal flex flex-col gap-8">
          <WorkCard
            slug="bmfx-identity"
            title="BMFX"
            meta="Branding"
            frame="square"
            sizes="(min-width: 1024px) 45vw, 92vw"
            className="rotate-1"
          />
          <div>
            <h3 className="eyebrow mb-3">{copy.bmfx.workHeading}</h3>
            <ul className="grid grid-cols-3 gap-3">
              {selectedVisuals.map((slug) => (
                <li key={slug}>
                  <WorkCard slug={slug} list={selectedVisuals} meta="Visuals" frame="square" sizes="(min-width: 1024px) 14vw, 30vw" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
