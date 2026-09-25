'use client'

import { useState } from 'react'

import { categoriesWithEntries, categoryLabels, publicProjects } from '@/content/projects'
import type { ProjectCategory } from '@/content/types'
import { cn } from '@/lib/cn'
import { WorkCard } from './WorkCard'

type Filter = 'all' | ProjectCategory

/** Filterable grid. Only categories that currently have public entries are offered. */
export function ProjectsGallery() {
  const categories = categoriesWithEntries()
  const [filter, setFilter] = useState<Filter>('all')
  const visible = filter === 'all' ? publicProjects : publicProjects.filter((project) => project.categories.includes(filter))
  const list = visible.map((project) => project.slug)
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
      <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = filter === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(option.value)}
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
        {filter === 'all' ? `Showing all ${visible.length} projects` : `Showing ${visible.length} ${categoryLabels[filter]} projects`}
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {visible.map((project) => (
          <li key={project.slug}>
            <WorkCard
              slug={project.slug}
              meta={project.categories.map((category) => categoryLabels[category]).join(' · ')}
              list={list}
              frame="square"
              sizes="(min-width: 1280px) 19vw, (min-width: 768px) 31vw, 46vw"
              className="h-full"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
