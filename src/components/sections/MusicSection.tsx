import { SectionTear } from '@/components/decor/Torn'
import { SoundCloudDeck } from '@/components/music/SoundCloudDeck'
import { ButtonLink } from '@/components/ui/Button'
import { platformIcons } from '@/components/ui/Icons'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WorkCard } from '@/components/work/WorkCard'
import { configuredSocialLinks } from '@/content/links'
import { soundcloudProfileUrl, tracks } from '@/content/music'
import { copy } from '@/content/site'

export function MusicSection() {
  const follow = configuredSocialLinks((link) => !link.listen)
  return (
    <section id="music" aria-labelledby="music-title" className="section overflow-hidden bg-ink-950">
      <SectionTear seed={101} from="ink-900" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_10%_20%,rgb(74_116_230/0.16),transparent_70%)]" />
      <div className="shell relative grid items-start gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="reveal">
          <SectionHeading id="music-title" eyebrow={copy.music.eyebrow} title={copy.music.heading} tone="yellow">
            {copy.music.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </SectionHeading>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={soundcloudProfileUrl} external variant="outline-yellow" icon={<platformIcons.soundcloud className="size-5" />}>
              {copy.music.more}
            </ButtonLink>
            {follow.map((link) => {
              const Icon = platformIcons[link.platform]
              return (
                <ButtonLink key={link.platform} href={link.url} external variant="outline-violet" size="sm" icon={<Icon className="size-4" />}>
                  {link.label}
                </ButtonLink>
              )
            })}
          </div>
          <div className="mt-10 hidden max-w-[16rem] lg:block">
            <WorkCard slug="symptoms" meta="Music artwork" frame="square" sizes="16rem" className="-rotate-2" />
          </div>
        </div>
        <div className="reveal">
          <SoundCloudDeck tracks={tracks} />
        </div>
      </div>
    </section>
  )
}
