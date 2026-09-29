'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { ArrowUpRight, CloseIcon, NextIcon, PauseIcon, PlayIcon, SoundCloudIcon } from '@/components/ui/Icons'
import { soundcloudApiUrl, soundcloudEmbedSrc } from '@/content/music'
import type { SoundCloudTrack } from '@/content/types'
import { cn } from '@/lib/cn'

/** The parts of SoundCloud's Widget API (w.soundcloud.com/player/api.js) used here. */
interface SoundCloudWidget {
  bind(event: string, listener: () => void): void
  play(): void
  pause(): void
  toggle(): void
  load(url: string, options: Record<string, string | boolean>): void
}

type SoundCloudGlobal = {
  Widget: ((iframe: HTMLIFrameElement) => SoundCloudWidget) & {
    Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string; ERROR: string }
  }
}

declare global {
  interface Window {
    SC?: SoundCloudGlobal
  }
}

const WIDGET_API = 'https://w.soundcloud.com/player/api.js'
let widgetApi: Promise<SoundCloudGlobal> | null = null

/** Loads SoundCloud's Widget API once, only after a visitor has pressed play. */
function loadWidgetApi(): Promise<SoundCloudGlobal> {
  if (window.SC?.Widget) return Promise.resolve(window.SC)
  widgetApi ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = WIDGET_API
    script.async = true
    script.onload = () => (window.SC ? resolve(window.SC) : reject(new Error('SoundCloud API missing')))
    script.onerror = () => {
      widgetApi = null
      reject(new Error('SoundCloud API failed to load'))
    }
    document.head.appendChild(script)
  })
  return widgetApi
}

/**
 * loading: player starting · blocked: the browser didn't let the player start by itself
 * · unsynced: playing in SoundCloud's own player without our extra controls
 */
type Status = 'idle' | 'loading' | 'blocked' | 'playing' | 'paused' | 'unsynced' | 'error'

const statusText: Record<Status, string> = {
  idle: 'Pick a track',
  loading: 'Loading the SoundCloud player…',
  blocked: 'Press play in the SoundCloud player below',
  playing: 'Playing',
  paused: 'Paused',
  unsynced: 'Use the SoundCloud player’s controls',
  error: 'SoundCloud couldn’t play this track',
}

/** How long to wait for SoundCloud to start before pointing at its own play button. */
const START_TIMEOUT = 8000

const embedOptions = {
  auto_play: true,
  color: '#9dfb58',
  hide_related: true,
  show_comments: false,
  show_user: true,
  show_reposts: false,
  show_teaser: false,
  visual: false,
}

/**
 * Track list + official SoundCloud player. Nothing from SoundCloud loads until
 * a visitor presses play; the animated record and equaliser only move while
 * SoundCloud reports that a track is actually playing.
 */
export function SoundCloudDeck({ tracks }: { tracks: SoundCloudTrack[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [firstTrack, setFirstTrack] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [deckInView, setDeckInView] = useState(true)
  const [miniHidden, setMiniHidden] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [synced, setSynced] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SoundCloudWidget | null>(null)
  const bindingRef = useRef(false)
  const activeRef = useRef<number | null>(null)
  const startTimer = useRef<number | undefined>(undefined)

  // Some browsers block playback that an embed starts by itself. If SoundCloud
  // hasn't started after a while, say so instead of "loading" forever.
  const expectStart = useCallback(() => {
    window.clearTimeout(startTimer.current)
    startTimer.current = window.setTimeout(() => setStatus((current) => (current === 'loading' ? 'blocked' : current)), START_TIMEOUT)
  }, [])
  useEffect(() => () => window.clearTimeout(startTimer.current), [])

  useEffect(() => {
    const deck = deckRef.current
    if (!deck) return
    const observer = new IntersectionObserver(([entry]) => setDeckInView(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(deck)
    return () => observer.disconnect()
  }, [])

  const select = useCallback(
    (index: number) => {
      const track = tracks[index]
      if (!track) return
      setMiniHidden(false)
      const widget = widgetRef.current
      if (activeRef.current === index && widget) {
        widget.toggle()
        return
      }
      activeRef.current = index
      setActive(index)
      setStatus('loading')
      expectStart()
      if (widget) widget.load(soundcloudApiUrl(track), embedOptions)
      // No player yet (or it is still starting): render the official player for this track.
      else setFirstTrack(index)
    },
    [tracks, expectStart],
  )

  // Keep the latest `select` for SoundCloud's event callbacks.
  const selectRef = useRef(select)
  useEffect(() => {
    selectRef.current = select
  }, [select])

  const onPlayerLoad = () => {
    // Bind once, even if the player reloads before SoundCloud's API has arrived.
    if (widgetRef.current || bindingRef.current) return
    bindingRef.current = true
    loadWidgetApi()
      .then((SC) => {
        const iframe = iframeRef.current
        if (!iframe) return
        const widget = SC.Widget(iframe)
        widgetRef.current = widget
        setSynced(true)
        const title = () => tracks[activeRef.current ?? 0]?.title ?? ''
        widget.bind(SC.Widget.Events.PLAY, () => {
          window.clearTimeout(startTimer.current)
          setStatus('playing')
          setAnnouncement(`Playing ${title()}`)
        })
        widget.bind(SC.Widget.Events.PAUSE, () => {
          setStatus('paused')
          setAnnouncement(`Paused ${title()}`)
        })
        widget.bind(SC.Widget.Events.ERROR, () => setStatus('error'))
        widget.bind(SC.Widget.Events.FINISH, () => {
          const next = (activeRef.current ?? 0) + 1
          if (next < tracks.length) selectRef.current(next)
          else setStatus('paused')
        })
      })
      // The embedded player still works on its own; only our extra controls are missing.
      .catch(() => {
        bindingRef.current = false
        window.clearTimeout(startTimer.current)
        setStatus('unsynced')
      })
  }

  /** Back to the full player: scroll to it and put focus on the current track. */
  const showDeck = () => {
    setMiniHidden(true)
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    deckRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
    deckRef.current?.querySelector<HTMLButtonElement>('li[aria-current] button')?.focus({ preventScroll: true })
  }

  const playing = status === 'playing'
  const current = active !== null ? tracks[active] : null
  const showMini = current && !deckInView && !miniHidden && synced && (status === 'playing' || status === 'paused')

  return (
    <>
      <div
        ref={deckRef}
        data-playing={playing}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-850 p-5 shadow-lift sm:p-7"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_0%,rgb(242_211_27/0.1),transparent_70%)]" />

        <div className="relative flex items-center gap-5 sm:gap-7">
          <Vinyl className="w-24 shrink-0 sm:w-32" />
          <div className="min-w-0">
            <p className="eyebrow">Now playing</p>
            <p className="font-marker mt-1 truncate text-2xl text-paper sm:text-3xl">{current ? current.title : 'EEMS'}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-haze">
              <Equalizer />
              <span>{statusText[status]}</span>
            </p>
          </div>
        </div>

        <ol className="relative mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {tracks.map((track, index) => {
            const isActive = active === index
            const isPlaying = isActive && playing
            return (
              <li key={track.trackId} className={cn('flex items-center gap-2', isActive && 'bg-white/[0.03]')} aria-current={isActive ? 'true' : undefined}>
                <button
                  type="button"
                  onClick={() => select(index)}
                  aria-label={`${isPlaying ? 'Pause' : 'Play'} ${track.title}`}
                  className="group flex min-h-14 flex-1 items-center gap-4 px-2 text-left"
                >
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-full border transition-colors',
                      isActive ? 'border-acid bg-acid text-ink-950' : 'border-white/20 text-paper group-hover:border-acid group-hover:text-acid',
                    )}
                  >
                    {isPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
                  </span>
                  <span className="w-6 shrink-0 text-xs font-semibold text-smoke tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  <span className={cn('min-w-0 flex-1 truncate font-semibold', isActive ? 'text-acid' : 'text-paper')}>{track.title}</span>
                  {isActive ? <Equalizer /> : null}
                </button>
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-11 shrink-0 place-items-center rounded-full text-smoke transition-colors hover:text-paper"
                >
                  <ArrowUpRight className="size-4" />
                  <span className="sr-only">Open {track.title} on SoundCloud (opens in a new tab)</span>
                </a>
              </li>
            )
          })}
        </ol>

        <div className="relative mt-5">
          {firstTrack !== null ? (
            <iframe
              ref={iframeRef}
              title={`${tracks[active ?? firstTrack].title} by EEMS — SoundCloud player`}
              src={soundcloudEmbedSrc(tracks[firstTrack], { autoPlay: true })}
              allow="autoplay"
              height={166}
              onLoad={onPlayerLoad}
              className="w-full rounded-lg border-0 bg-ink-900"
            />
          ) : (
            <p className="flex items-center gap-2 text-sm text-smoke">
              <SoundCloudIcon className="size-5 shrink-0" />
              Tracks play through SoundCloud’s own player, which loads when you press play.
            </p>
          )}
          <noscript>
            <p className="mt-3 text-sm text-haze">Turn on JavaScript to play the tracks here, or open them on SoundCloud with the arrow links.</p>
          </noscript>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      {/* Rendered on <body>: an animated (transformed) ancestor would otherwise stop it being fixed to the screen. */}
      {showMini && current
        ? createPortal(
            <div
              role="region"
              aria-label="Now playing"
              data-playing={playing}
              className="mini-player fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-full border border-white/15 bg-ink-900/95 p-2 pr-3 shadow-lift backdrop-blur-sm"
            >
              <Vinyl className="w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-paper">{current.title}</p>
                <p className="truncate text-xs text-smoke">
                  {statusText[status]} · SoundCloud
                </p>
              </div>
              <button
                type="button"
                onClick={() => widgetRef.current?.toggle()}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-acid text-ink-950"
              >
                {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
                <span className="sr-only">{playing ? 'Pause' : 'Play'}</span>
              </button>
              {active !== null && active < tracks.length - 1 ? (
                <button
                  type="button"
                  onClick={() => select(active + 1)}
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-paper hover:border-acid"
                >
                  <NextIcon className="size-4" />
                  <span className="sr-only">Next track: {tracks[active + 1].title}</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={showDeck}
                className="hidden min-h-11 shrink-0 px-2 text-xs font-semibold tracking-nav text-haze uppercase hover:text-paper sm:block"
              >
                Player
              </button>
              <button
                type="button"
                onClick={() => setMiniHidden(true)}
                className="grid size-9 shrink-0 place-items-center rounded-full text-smoke hover:text-paper"
              >
                <CloseIcon className="size-4" />
                <span className="sr-only">Hide the mini player</span>
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

/** Decorative record with an EEMS label; spins only while a track is playing. */
function Vinyl({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('relative block aspect-square', className)}>
      <span className="vinyl absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#15131b_0_2px,#0a090e_2px_4px)] shadow-[0_10px_24px_-8px_rgb(0_0_0/0.9),inset_0_0_0_1px_rgb(255_255_255/0.06)]">
        <span className="absolute inset-[30%] grid place-items-center rounded-full bg-eems-yellow">
          <span className="font-marker text-[clamp(0.55rem,1.4vw,0.95rem)] leading-none text-ink-950">EEMS</span>
        </span>
        <span className="absolute inset-[47%] rounded-full bg-ink-950" />
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_40deg,transparent_0_12%,rgb(255_255_255/0.08)_18%,transparent_26%_62%,rgb(255_255_255/0.06)_68%,transparent_76%)]" />
      </span>
    </span>
  )
}

/** Four bars that bounce only while playing (static otherwise, and with reduced motion). */
function Equalizer() {
  return (
    <span aria-hidden="true" className="inline-flex h-4 items-end gap-[3px]">
      {[0, 0.2, 0.4, 0.1].map((delay) => (
        <span key={delay} className="eq-bar block h-full w-[3px] rounded-full bg-acid" style={{ animationDelay: `${delay}s` }} />
      ))}
    </span>
  )
}
