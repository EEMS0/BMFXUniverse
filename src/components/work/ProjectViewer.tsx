'use client'

import { createContext, type KeyboardEvent, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { artwork } from '@/content/artwork'
import { ENQUIRY_SECTION, sectionHref } from '@/content/navigation'
import { getPublicProject } from '@/content/projects'
import { ArtImage } from '@/components/ui/ArtImage'
import { buttonClasses } from '@/components/ui/Button'
import { ArrowUpRight, ChevronLeft, ChevronRight, CloseIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { focusSection } from '@/lib/focus-section'
import { workHref } from '@/lib/paths'
import { ProjectMeta } from './ProjectMeta'

interface ViewerApi {
  /** Opens a project. `list` sets the order for previous/next; `trigger` receives focus on close. */
  open(slug: string, list?: string[], trigger?: HTMLElement | null): void
}

const ViewerContext = createContext<ViewerApi | null>(null)

/** Null outside the provider; cards then behave as plain links to /work/[slug]. */
export const useProjectViewer = () => useContext(ViewerContext)

interface ViewerState {
  slug: string
  list: string[]
  image: number
}

export function ProjectViewerProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const skipFocusReturn = useRef(false)
  const [state, setState] = useState<ViewerState | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const open = useCallback<ViewerApi['open']>((slug, list, trigger) => {
    triggerRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    skipFocusReturn.current = false
    setAnnouncement('')
    setState({ slug, list: list?.includes(slug) ? list : [slug], image: 0 })
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (state && dialog && !dialog.open) {
      dialog.showModal()
      closeRef.current?.focus()
    }
  }, [state])

  const close = () => dialogRef.current?.close()

  const handleClose = () => {
    setState(null)
    const trigger = triggerRef.current
    triggerRef.current = null
    if (!skipFocusReturn.current && trigger?.isConnected) trigger.focus()
  }

  const go = (delta: number) => {
    if (!state || state.list.length < 2) return
    const index = state.list.indexOf(state.slug)
    const slug = state.list[(index + delta + state.list.length) % state.list.length]
    const next = getPublicProject(slug)
    setState({ ...state, slug, image: 0 })
    if (next) setAnnouncement(`${next.title}, ${state.list.indexOf(slug) + 1} of ${state.list.length}`)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') go(1)
    else if (event.key === 'ArrowLeft') go(-1)
  }

  const project = state ? getPublicProject(state.slug) : undefined
  const imageId = project ? (project.images[state?.image ?? 0] ?? project.images[0]) : undefined
  const position = state ? state.list.indexOf(state.slug) + 1 : 0
  const prev = state && state.list.length > 1 ? getPublicProject(state.list[(position - 2 + state.list.length) % state.list.length]) : undefined
  const next = state && state.list.length > 1 ? getPublicProject(state.list[position % state.list.length]) : undefined

  return (
    <ViewerContext value={{ open }}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby={project ? 'viewer-title' : undefined}
        aria-label={project ? undefined : 'Project viewer'}
        onClose={handleClose}
        onKeyDown={onKeyDown}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-paper backdrop:bg-ink-950/92"
      >
        {project && imageId && state ? (
          <div className="flex h-full flex-col bg-ink-950/60 lg:flex-row">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="absolute top-3 right-3 z-10 grid size-12 place-items-center rounded-full border border-white/20 bg-ink-900/90 text-paper transition hover:border-acid hover:text-acid"
            >
              <CloseIcon className="size-5" />
              <span className="sr-only">Close viewer</span>
            </button>
            <div
              className="relative min-h-0 flex-1 p-3 pt-16 sm:p-6 sm:pt-16 lg:p-10"
              onClick={(event) => {
                if (event.target === event.currentTarget) close()
              }}
            >
              <div
                className={cn(
                  'relative h-full w-full',
                  artwork[imageId].transparent && 'rounded-lg bg-[radial-gradient(circle_at_50%_42%,#4a2f49,#140f19_72%)]',
                )}
              >
                <ArtImage
                  key={imageId}
                  id={imageId}
                  fill
                  // Needed the moment the viewer opens, so don't wait for lazy loading.
                  loading="eager"
                  quality={85}
                  sizes="(min-width: 1024px) calc(100vw - 26rem), 100vw"
                  className={cn('object-contain', artwork[imageId].transparent && 'p-4 sm:p-8')}
                  style={{ objectPosition: 'center', objectFit: 'contain' }}
                />
              </div>
            </div>

            <aside className="max-h-[46dvh] shrink-0 overflow-x-hidden overflow-y-auto border-t border-white/10 bg-ink-900 p-5 sm:p-6 lg:max-h-none lg:w-[24rem] lg:border-t-0 lg:border-l lg:p-8 lg:pt-20">
              {state.list.length > 1 ? (
                <p className="eyebrow mb-3">
                  {position} / {state.list.length}
                </p>
              ) : null}
              <ProjectMeta project={project} headingId="viewer-title" />

              {project.images.length > 1 ? (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Images in this project">
                  {project.images.map((id, index) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setState({ ...state, image: index })}
                        aria-pressed={state.image === index}
                        aria-label={`Show image ${index + 1} of ${project.images.length}`}
                        className={cn(
                          'relative block size-16 overflow-hidden rounded-md border-2 bg-ink-700 transition',
                          state.image === index ? 'border-acid' : 'border-transparent opacity-75 hover:opacity-100',
                        )}
                      >
                        <ArtImage id={id} decorative fill loading="eager" sizes="64px" className={artwork[id].transparent ? 'object-contain p-1' : 'object-cover'} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {prev && next ? (
                <div className="mt-8 flex gap-2">
                  <button type="button" onClick={() => go(-1)} className={buttonClasses('outline-violet', 'sm', 'min-w-0 flex-1 gap-2 px-3')}>
                    <ChevronLeft className="size-4 shrink-0" />
                    <span className="sr-only">Previous project: </span>
                    <span className="truncate">{prev.title}</span>
                  </button>
                  <button type="button" onClick={() => go(1)} className={buttonClasses('outline-violet', 'sm', 'min-w-0 flex-1 gap-2 px-3')}>
                    <span className="sr-only">Next project: </span>
                    <span className="truncate">{next.title}</span>
                    <ChevronRight className="size-4 shrink-0" />
                  </button>
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm">
                <a href={workHref(project.slug)} className="inline-flex min-h-11 items-center gap-2 font-semibold text-haze underline-offset-4 hover:text-paper hover:underline">
                  Open this project’s page
                  <ArrowUpRight className="size-4" />
                </a>
                <a
                  href={sectionHref(ENQUIRY_SECTION)}
                  onClick={() => {
                    skipFocusReturn.current = true
                    close()
                    focusSection(ENQUIRY_SECTION)
                  }}
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-acid underline-offset-4 hover:underline"
                >
                  Enquire about design or video work
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </aside>

            <p className="sr-only" aria-live="polite">
              {announcement}
            </p>
          </div>
        ) : null}
      </dialog>
    </ViewerContext>
  )
}
