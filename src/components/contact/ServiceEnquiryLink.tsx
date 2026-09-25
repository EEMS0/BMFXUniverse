'use client'

import type { MouseEvent } from 'react'

import type { EnquiryServiceId } from '@/content/services'
import { ArrowRight } from '@/components/ui/Icons'
import { requestService, serviceEnquiryHref } from '@/lib/enquiry/intent'
import { cn } from '@/lib/cn'

/**
 * Jumps to the enquiry form with this service preselected. Without JavaScript
 * it still leads to the form (the service is then chosen by hand).
 */
export function ServiceEnquiryLink({ service, name, className }: { service: EnquiryServiceId; name: string; className?: string }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const form = document.getElementById('enquiry-form')
    if (!form || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    requestService(service)
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    form.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
    form.focus({ preventScroll: true })
  }

  return (
    <a
      href={serviceEnquiryHref(service)}
      onClick={onClick}
      className={cn('group/link inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-acid underline-offset-4 hover:underline', className)}
    >
      Enquire about {name.toLowerCase()}
      <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
    </a>
  )
}
