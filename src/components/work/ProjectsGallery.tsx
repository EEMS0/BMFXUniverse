'use client'

import { useState } from 'react'
import { flushSync } from 'react-dom'

import { categoriesWithEntries, categoryLabels, publicProjects } from '@/content/projects'
import type { ProjectCategory } from '@/content/types'
import { cn } from '@/lib/cn'
import { WorkCard } from './WorkCard'

type Filter = 'all' | ProjectCategory

/**
 * Filterable grid. Only categories that currently have public entries are
 * offered. Where the browser supports View Transitions (and motion is welcome),
 * cards glide to their new places; otherwise the grid simply updates.
 */
export function ProjectsGallery() {
  const categories = categoriesWithEntries()
  const [filter, setFilter] = useState<Filter>('all')
  const visible = filter === 'all' ? publicProjects : publicProjects.filter((project) => project.categories.includes(filter))
  const list = visible.map((project) => project.slug)

  const choose = (value: Filter) => {
    if (value === filter) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (calm || !('startViewTransition' in document)) {
      setFilter(value)
      return
    }
    document.startViewTransition(() => flushSync(() => setFilter(value)))
  }
  const options: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: publicProjects.length },
    ...categories.map((category) => ({
      value: category,
      label: categoryLabels[category],
      count: publicProjects.filter((project) => project.categories.includes(category)).length,
    })),
  ]

  return (
    <div>
      <div role="group" aria-label="Filter the art by category" className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = filter === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => choose(option.value)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.8125rem] font-semibold tracking-nav uppercase transition-colors',
                selected ? 'border-acid bg-acid text-ink-950' : 'border-white/15 text-haze hover:border-white/35 hover:text-paper',
              )}
            >
              {option.label}
              <span className={cn('text-xs tabular-nums', selected ? 'text-ink-950/70' : 'text-smoke')}>{option.count}</span>
            </button>
          )
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {filter === 'all' ? `Showing all ${visible.length} pieces` : `Showing ${visible.length} ${categoryLabels[filter]} pieces`}
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
        {visible.map((project, index) => {
          // With an odd count, the first piece spans both columns on phones so no card is left on its own.
          const featured = index === 0 && visible.length % 2 === 1
          return (
            <li key={project.slug} className={cn(featured && 'max-md:col-span-2')}>
              <WorkCard
                slug={project.slug}
                meta={project.categories.map((category) => categoryLabels[category]).join(' · ')}
                list={list}
                frame="square"
                transitionName={`art-${project.slug}`}
                sizes={`(min-width: 1536px) 460px, (min-width: 768px) 31vw, ${featured ? '92vw' : '46vw'}`}
                className="h-full"
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
