/**
 * Lets "Enquire about …" links anywhere on the page preselect a service in the
 * enquiry form, using the same ids as the form and the server validation.
 */
import { type EnquiryServiceId, isEnquiryServiceId } from '@/content/services'
import { withBase } from '@/lib/paths'

const EVENT = 'eems:enquire-service'

export function requestService(service: EnquiryServiceId) {
  window.dispatchEvent(new CustomEvent<EnquiryServiceId>(EVENT, { detail: service }))
}

export function onServiceRequested(handler: (service: EnquiryServiceId) => void): () => void {
  const listener = (event: Event) => {
    const service = (event as CustomEvent<unknown>).detail
    if (isEnquiryServiceId(service)) handler(service)
  }
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

/** Reads `?service=` from a URL search string (deep links such as /?service=video-editing#hire-me). */
export function serviceFromSearch(search: string): EnquiryServiceId | null {
  const value = new URLSearchParams(search).get('service')
  return isEnquiryServiceId(value) ? value : null
}

export const serviceEnquiryHref = (service: EnquiryServiceId) => withBase(`/?service=${service}#enquiry-form`)
