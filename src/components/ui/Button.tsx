import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { ArrowRight, ArrowUpRight } from './Icons'

export type ButtonVariant = 'acid' | 'outline-acid' | 'outline-violet' | 'outline-orbit' | 'outline-yellow'

const variants: Record<ButtonVariant, string> = {
  acid: 'bg-acid text-ink-950 hover:bg-[#b3ff7d] hover:shadow-acid',
  'outline-acid': 'border border-acid/70 text-acid hover:bg-acid/10 hover:shadow-acid',
  'outline-violet': 'border border-violet/80 text-paper hover:bg-violet/15 hover:shadow-violet',
  'outline-orbit': 'border border-orbit/80 text-orbit hover:bg-orbit/10 hover:shadow-orbit',
  'outline-yellow': 'border border-eems-yellow/70 text-eems-yellow hover:bg-eems-yellow/10',
}

const sizes = {
  md: 'min-h-12 px-6 text-[0.8125rem]',
  sm: 'min-h-11 px-5 text-[0.75rem]',
}

/** Shared by links and real <button>s so every call to action looks consistent. */
export function buttonClasses(variant: ButtonVariant = 'acid', size: keyof typeof sizes = 'md', className?: string) {
  return cn(
    'group/btn relative inline-flex items-center justify-center gap-3 rounded-full font-semibold uppercase tracking-(--tracking-nav)',
    'transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-(--ease-snap)',
    'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  )
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: ButtonVariant
  size?: keyof typeof sizes
  /** Leading icon (decorative). */
  icon?: ReactNode
  /** Opens in a new tab with an arrow that says so. */
  external?: boolean
  /**
   * Navigate with the Next.js router (for links to another page). Same-page
   * section links stay plain anchors so browsers handle focus natively.
   */
  clientNav?: boolean
  children: ReactNode
}

export function ButtonLink({ href, variant, size, icon, external, clientNav, className, children, ...rest }: ButtonLinkProps) {
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {external ? (
        <>
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      ) : (
        <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
      )}
    </>
  )
  const classes = buttonClasses(variant, size, className)

  if (clientNav && !external) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  return (
    <a href={href} className={classes} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {content}
    </a>
  )
}
