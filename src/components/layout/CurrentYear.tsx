'use client'

import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * The current year. The server renders the year of the build; the browser then
 * shows its own current year, so the copyright line never goes stale.
 */
export function CurrentYear({ fallback }: { fallback: number }) {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => fallback)
  return <>{year}</>
}
