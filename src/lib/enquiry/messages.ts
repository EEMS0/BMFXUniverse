import type { EnquiryOutcome } from './types'

/** Visitor-facing explanations for every outcome that is not a submission. */
export const ENQUIRY_MESSAGES: Record<Exclude<EnquiryOutcome, 'submitted'>, string> = {
  invalid: 'Some details need attention. Check the highlighted fields.',
  not_configured: 'Online enquiries aren’t switched on yet, so your message has not been sent.',
  rate_limited: 'Too many enquiries have come from this connection recently. Please wait a while and try again.',
  too_large: 'This enquiry is too long to send. Please shorten the project details or reference links.',
  rejected: 'This submission could not be accepted.',
  delivery_failed: 'The email service didn’t accept your enquiry, so it has not been sent. Please try again later.',
}
