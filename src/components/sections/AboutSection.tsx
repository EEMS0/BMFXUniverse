import { Squiggle } from '@/components/decor/Doodles'
import { PaperScrap, SectionTear } from '@/components/decor/Torn'
import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ENQUIRY_SECTION, sectionHref } from '@/content/navigation'
import { copy, site } from '@/content/site'

/** Short and personal: the relationship between EEMS and BMFX, nothing invented. */
export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="section overflow-hidden">
      <SectionTear seed={505} from="ink-950" />
      <div className="shell grid items-center gap-12 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
        {/* The two identities side by side on a torn sheet (decorative; the heading names them). */}
        <div aria-hidden="true" className="reveal relative mx-auto aspect-[5/4] w-full max-w-[34rem]">
          <PaperScrap seed={57} tone="ink" depth={2.2} className="inset-0 -rotate-2" />
          <PaperScrap seed={63} tone="violet" depth={3} className="inset-[14%_-3%_-4%_42%] rotate-3 opacity-90" />
          <ArtImage id="eemsWordmark" decorative sizes="(min-width: 768px) 30vw, 80vw" className="absolute top-[2%] left-[-4%] h-auto w-[78%] -rotate-3" />
          <span className="font-marker absolute top-[40%] left-[47%] text-7xl text-lilac [text-shadow:0_4px_12px_rgb(0_0_0/0.8)]">+</span>
          <ArtImage
            id="bmfxLogo"
            decorative
            sizes="(min-width: 768px) 20vw, 50vw"
            className="absolute right-[4%] bottom-[5%] h-auto w-[50%] rotate-2 [filter:drop-shadow(0_16px_20px_rgb(0_0_0/0.8))]"
          />
        </div>

        <div className="reveal">
          <SectionHeading id="about-title" eyebrow="About" title={copy.about.heading} tone="yellow" note={site.annotation}>
            {copy.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </SectionHeading>
          <Squiggle aria-hidden="true" className="mt-6 w-32 text-violet/70" />
          <ButtonLink href={sectionHref(ENQUIRY_SECTION)} variant="outline-acid" className="mt-6">
            Hire me
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
