import type { FieldErrors } from './validation'

/** Outcomes of POST /api/enquiry. Only `submitted` means the email provider accepted the message. */
export type EnquiryOutcome =
  | 'submitted'
  | 'invalid'
  | 'not_configured'
  | 'rate_limited'
  | 'too_large'
  | 'rejected'
  | 'delivery_failed'

export type EnquiryResponse =
  | { ok: true; status: 'submitted' }
  | {
      ok: false
      status: Exclude<EnquiryOutcome, 'submitted'>
      message: string
      errors?: FieldErrors
      retryAfterSeconds?: number
    }

/** Slugs of the no-JavaScript result pages under /enquiry/[status]. */
export const outcomeSlugs: Record<EnquiryOutcome, string> = {
  submitted: 'sent',
  invalid: 'invalid',
  not_configured: 'not-configured',
  rate_limited: 'rate-limited',
  too_large: 'too-large',
  rejected: 'rejected',
  delivery_failed: 'failed',
}
