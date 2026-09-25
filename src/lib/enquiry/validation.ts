/**
 * Enquiry validation shared by the browser (assistance) and the server
 * (authoritative). The server never trusts the client's result.
 */
import { type EnquiryServiceId, isEnquiryServiceId } from '@/content/services'

export const ENQUIRY_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  details: { min: 10, max: 5000 },
  budget: { max: 120 },
  timeframe: { max: 120 },
  references: { max: 1500 },
} as const

/** Upper bound for the raw request body (JSON or form-encoded). */
export const MAX_ENQUIRY_BYTES = 32 * 1024

/** Name of the hidden anti-spam field. Real visitors never see or fill it. */
export const HONEYPOT_FIELD = 'extra_notes'

export type EnquiryField = 'name' | 'email' | 'services' | 'details' | 'budget' | 'timeframe' | 'references'

export const ENQUIRY_FIELDS: EnquiryField[] = ['name', 'email', 'services', 'details', 'budget', 'timeframe', 'references']

export interface EnquiryData {
  name: string
  email: string
  services: EnquiryServiceId[]
  details: string
  budget: string
  timeframe: string
  references: string
}

export type FieldErrors = Partial<Record<EnquiryField, string>>

export type ValidationResult = { ok: true; data: EnquiryData } | { ok: false; errors: FieldErrors }

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"']+@[^\s@<>()[\]\\,;:"']+\.[^\s@<>()[\]\\,;:"'.]{2,}$/
// C0/C1 control characters, excluding tab (\u0009) and line feed (\u000A).
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g

/** Single-line text: collapse whitespace (including line breaks) and drop control characters. */
function singleLine(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').replace(CONTROL_CHARS, '').trim()
}

/** Multi-line text: normalise line endings, drop control characters, trim trailing space. */
function multiLine(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}

function toServiceList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value) return [value]
  return []
}

const count = (value: number) => value.toLocaleString('en-GB')

export function validateEnquiry(input: unknown): ValidationResult {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: FieldErrors = {}

  const name = singleLine(source.name)
  if (!name) errors.name = 'Please enter your name.'
  else if (name.length < ENQUIRY_LIMITS.name.min) errors.name = `Your name needs at least ${ENQUIRY_LIMITS.name.min} characters.`
  else if (name.length > ENQUIRY_LIMITS.name.max) errors.name = `Please keep your name under ${ENQUIRY_LIMITS.name.max} characters.`

  const email = singleLine(source.email)
  if (!email) errors.email = 'Please enter your email address.'
  else if (email.length > ENQUIRY_LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address, like name@example.com.'
  }

  const rawServices = toServiceList(source.services)
  const services = [...new Set(rawServices)].filter(isEnquiryServiceId)
  if (rawServices.length === 0) errors.services = 'Choose at least one service, or “Something else / not sure”.'
  else if (services.length !== new Set(rawServices).size) errors.services = 'Please choose from the listed services.'

  const details = multiLine(source.details)
  if (!details) errors.details = 'Please tell me a little about the project.'
  else if (details.length < ENQUIRY_LIMITS.details.min) {
    errors.details = `Please add a bit more detail (at least ${ENQUIRY_LIMITS.details.min} characters).`
  } else if (details.length > ENQUIRY_LIMITS.details.max) {
    errors.details = `Please keep the project details under ${count(ENQUIRY_LIMITS.details.max)} characters.`
  }

  const budget = singleLine(source.budget)
  if (budget.length > ENQUIRY_LIMITS.budget.max) errors.budget = `Please keep the budget under ${ENQUIRY_LIMITS.budget.max} characters.`

  const timeframe = singleLine(source.timeframe)
  if (timeframe.length > ENQUIRY_LIMITS.timeframe.max) {
    errors.timeframe = `Please keep the deadline or timeframe under ${ENQUIRY_LIMITS.timeframe.max} characters.`
  }

  const references = multiLine(source.references)
  if (references.length > ENQUIRY_LIMITS.references.max) {
    errors.references = `Please keep reference links under ${count(ENQUIRY_LIMITS.references.max)} characters.`
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { name, email, services, details, budget, timeframe, references } }
}

/** Errors for the fields a visitor has already interacted with (for on-blur assistance). */
export function errorsFor(fields: Iterable<EnquiryField>, input: unknown): FieldErrors {
  const result = validateEnquiry(input)
  if (result.ok) return {}
  const picked: FieldErrors = {}
  for (const field of fields) if (result.errors[field]) picked[field] = result.errors[field]
  return picked
}
