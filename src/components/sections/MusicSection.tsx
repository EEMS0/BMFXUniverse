import { PaperScrap, SectionTear } from '@/components/decor/Torn'
import { ButtonLink } from '@/components/ui/Button'
import { ArrowRight, platformIcons } from '@/components/ui/Icons'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WorkCard } from '@/components/work/WorkCard'
import { configuredSocialLinks } from '@/content/links'
import { musicArtwork, playableTracks } from '@/content/music'
import { sectionHref } from '@/content/navigation'
import { copy } from '@/content/site'
import type { Track } from '@/content/types'

/** Only rendered when a real audio file or embed is configured in content/music.ts. */
function TrackList({ tracks }: { tracks: Track[] }) {
  return (
    <ul className="mt-8 space-y-4" aria-label="Tracks">
      {tracks.map((track) => (
        <li key={track.title} className="rounded-xl border border-white/10 bg-ink-850 p-4">
          <p className="mb-3 font-semibold text-paper">{track.title}</p>
          {track.audio ? (
            <audio controls preload="none" className="w-full">
              <source src={track.audio.src} type={track.audio.type} />
              Your browser can’t play this audio.
            </audio>
          ) : track.embed ? (
            <iframe
              title={`${track.title} (${track.embed.provider} player)`}
              src={track.embed.src}
              height={track.embed.height}
              loading="lazy"
              allow="encrypted-media"
              className="w-full rounded-lg border-0"
            />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function MusicSection() {
  const listen = configuredSocialLinks((link) => link.listen)
  const follow = configuredSocialLinks((link) => !link.listen)
  const tracks = playableTracks()
  const list = musicArtwork.map((item) => item.projectSlug)

  return (
    <section id="music" aria-labelledby="music-title" className="section overflow-hidden">
      <SectionTear seed={101} from="ink-950" />
      <PaperScrap seed={31} tone="violet" depth={2.6} className="top-[12%] right-[-6%] h-[70%] w-[48%] rotate-[-3deg] opacity-60 max-lg:hidden" />
      <div className="shell relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="reveal">
          <SectionHeading id="music-title" eyebrow={copy.music.eyebrow} title={copy.music.heading} tone="yellow">
            {copy.music.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </SectionHeading>

          {tracks.length ? <TrackList tracks={tracks} /> : null}

          {listen.length || follow.length ? (
            <div className="mt-9">
              <h3 className="eyebrow mb-3">{copy.music.listenHeading}</h3>
              <ul className="flex flex-wrap gap-3">
                {listen.map((link) => {
                  const Icon = platformIcons[link.platform]
                  return (
                    <li key={link.platform}>
                      <ButtonLink href={link.url} external variant="acid" icon={<Icon className="size-5" />}>
                        Listen on {link.label}
                      </ButtonLink>
                    </li>
                  )
                })}
                {follow.map((link) => {
                  const Icon = platformIcons[link.platform]
                  return (
                    <li key={link.platform}>
                      <ButtonLink href={link.url} external variant="outline-violet" icon={<Icon className="size-5" />}>
                        {link.label}
                      </ButtonLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          <a
            href={sectionHref('art')}
            className="group mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-lilac underline-offset-4 hover:underline"
          >
            See the merch artwork
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="reveal grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-end gap-3 sm:gap-4">
          {musicArtwork.map((item, index) => (
            <WorkCard
              key={item.projectSlug}
              slug={item.projectSlug}
              title={item.caption.split(' — ')[0]}
              meta="Artwork"
              list={list}
              frame={index === 0 ? 'square' : 'portrait'}
              sizes={index === 0 ? '(min-width: 1024px) 30vw, 58vw' : '(min-width: 1024px) 21vw, 40vw'}
              className={index === 0 ? '-rotate-1' : 'rotate-2'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
