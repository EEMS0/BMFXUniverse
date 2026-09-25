'use client'

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'

import { configuredSocialLinks, publicContactEmail } from '@/content/links'
import { type EnquiryServiceId, enquiryServiceOptions, serviceName } from '@/content/services'
import { buttonClasses } from '@/components/ui/Button'
import { AlertIcon, ArrowRight, CheckIcon, InfoIcon, MailIcon, Spinner, platformIcons } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { IS_STATIC_PREVIEW, withBase } from '@/lib/paths'
import { onServiceRequested, serviceFromSearch } from '@/lib/enquiry/intent'
import type { EnquiryResponse } from '@/lib/enquiry/types'
import {
  ENQUIRY_FIELDS,
  ENQUIRY_LIMITS,
  type EnquiryField,
  type FieldErrors,
  HONEYPOT_FIELD,
  errorsFor,
  validateEnquiry,
} from '@/lib/enquiry/validation'

interface Values {
  name: string
  email: string
  services: EnquiryServiceId[]
  details: string
  budget: string
  timeframe: string
  references: string
}

const EMPTY: Values = { name: '', email: '', services: [], details: '', budget: '', timeframe: '', references: '' }

const LABELS: Record<EnquiryField, string> = {
  name: 'Name',
  email: 'Email',
  services: 'Service(s)',
  details: 'Project details',
  budget: 'Budget',
  timeframe: 'Deadline / timeframe',
  references: 'Reference links',
}

const fieldId = (field: EnquiryField) => `enquiry-${field}`

const ENQUIRY_API = withBase('/api/enquiry')

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; email: string }
  | { kind: 'invalid' }
  | { kind: 'problem'; title: string; message: string; offerAlternatives: boolean }

const PROBLEM_TITLES: Record<string, string> = {
  not_configured: 'Enquiry not sent: email isn’t set up yet',
  rate_limited: 'Enquiry not sent: too many attempts',
  too_large: 'Enquiry not sent: too long',
  rejected: 'Enquiry not sent',
  delivery_failed: 'Enquiry not sent',
}

function withoutField(errors: FieldErrors, field: EnquiryField): FieldErrors {
  const next = { ...errors }
  delete next[field]
  return next
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [delivery, setDelivery] = useState<'unknown' | 'checking' | 'on' | 'off'>('unknown')
  const [announcement, setAnnouncement] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const pending = useRef(false)
  // What to focus after the next render: the result message or the confirmation.
  const focusAfterRender = useRef<'alert' | 'success' | null>(null)
  const socials = configuredSocialLinks()

  // With JavaScript the form validates itself and shows its own messages.
  // Without it, the browser's built-in validation still applies.
  useEffect(() => {
    if (formRef.current) formRef.current.noValidate = true
  }, [])

  // Preselect a service from ?service= or from any "Enquire about …" link.
  useEffect(() => {
    const select = (service: EnquiryServiceId) => {
      setValues((current) => (current.services.includes(service) ? current : { ...current, services: [...current.services, service] }))
      setErrors((current) => withoutField(current, 'services'))
      setAnnouncement(`${serviceName(service)} selected in the enquiry form.`)
    }
    const fromUrl = serviceFromSearch(window.location.search)
    const unsubscribe = onServiceRequested(select)
    if (fromUrl) queueMicrotask(() => select(fromUrl))
    return unsubscribe
  }, [])

  /** Asks the server once whether email delivery is configured, on first interaction. */
  const checkDelivery = () => {
    if (IS_STATIC_PREVIEW || delivery !== 'unknown') return
    setDelivery('checking')
    fetch(ENQUIRY_API, { cache: 'no-store' })
      .then((response) => (response.ok ? (response.json() as Promise<{ configured?: boolean }>) : null))
      .then((data) => setDelivery(data?.configured === false ? 'off' : 'on'))
      .catch(() => setDelivery('unknown'))
  }

  const revalidate = (field: EnquiryField, next: Values) => {
    const message = errorsFor([field], next)[field]
    setErrors((current) => (message ? { ...current, [field]: message } : withoutField(current, field)))
  }

  const update = <K extends keyof Values>(field: K, value: Values[K]) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (attempted || errors[field]) revalidate(field, next)
  }

  const onBlur = (field: EnquiryField) => {
    const value = values[field]
    if (attempted || (typeof value === 'string' ? value.trim() : value.length)) revalidate(field, values)
  }

  // Move focus only after React has committed the new state, so the target exists.
  useEffect(() => {
    const target = focusAfterRender.current
    focusAfterRender.current = null
    if (target === 'success') successRef.current?.focus()
    else if (target === 'alert') alertRef.current?.focus()
  }, [status])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending.current) return
    setAttempted(true)

    const payload = { ...values, [HONEYPOT_FIELD]: honeypotRef.current?.value ?? '' }
    const check = validateEnquiry(payload)
    if (!check.ok) {
      setErrors(check.errors)
      focusAfterRender.current = 'alert'
      setStatus({ kind: 'invalid' })
      return
    }

    if (IS_STATIC_PREVIEW) {
      // GitHub Pages preview: there is no server, so nothing can be sent. Say so plainly.
      focusAfterRender.current = 'alert'
      setStatus({
        kind: 'problem',
        title: 'Enquiry not sent: this is a preview',
        message: 'This preview of the site has no server, so enquiries can’t be sent from it. Your text is still in the form.',
        offerAlternatives: true,
      })
      return
    }

    pending.current = true
    setErrors({})
    setStatus({ kind: 'sending' })
    let next: Status
    try {
      const response = await fetch(ENQUIRY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await response.json().catch(() => null)) as EnquiryResponse | null
      if (response.ok && data?.ok) {
        next = { kind: 'sent', email: check.data.email }
        setValues(EMPTY)
        setAttempted(false)
      } else if (data && !data.ok && data.status === 'invalid') {
        setErrors(data.errors ?? {})
        next = { kind: 'invalid' }
      } else if (data && !data.ok) {
        if (data.status === 'not_configured') setDelivery('off')
        const wait = data.retryAfterSeconds ? ` Try again in about ${Math.max(1, Math.ceil(data.retryAfterSeconds / 60))} minute(s).` : ''
        next = {
          kind: 'problem',
          title: PROBLEM_TITLES[data.status] ?? 'Enquiry not sent',
          message: `${data.message}${wait}`,
          offerAlternatives: data.status === 'not_configured' || data.status === 'delivery_failed',
        }
      } else {
        next = {
          kind: 'problem',
          title: 'Enquiry not sent',
          message: 'The server sent an unexpected response, so your enquiry has not been sent. Please try again.',
          offerAlternatives: true,
        }
      }
    } catch {
      next = {
        kind: 'problem',
        title: 'Couldn’t reach the server',
        message: 'Your enquiry has not been sent. Check your connection and try again — your text is still in the form.',
        offerAlternatives: false,
      }
    }
    pending.current = false
    focusAfterRender.current = next.kind === 'sent' ? 'success' : 'alert'
    setStatus(next)
  }

  const describedBy = (field: EnquiryField, hint?: boolean) =>
    [hint ? `${fieldId(field)}-hint` : null, errors[field] ? `${fieldId(field)}-error` : null].filter(Boolean).join(' ') || undefined

  const sending = status.kind === 'sending'
  const errorList = ENQUIRY_FIELDS.filter((field) => errors[field])

  const alternatives =
    socials.length || publicContactEmail ? (
      <ul className="mt-3 flex flex-wrap gap-2">
        {socials
          .filter((link) => link.platform === 'instagram' || link.platform === 'tiktok')
          .map((link) => {
            const Icon = platformIcons[link.platform]
            return (
              <li key={link.platform}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-paper hover:border-acid"
                >
                  <Icon className="size-4" />
                  Message on {link.label}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            )
          })}
        {publicContactEmail ? (
          <li>
            <a
              href={`mailto:${publicContactEmail}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-paper hover:border-acid"
            >
              <MailIcon className="size-4" />
              Email {publicContactEmail} (opens your email app)
            </a>
          </li>
        ) : null}
      </ul>
    ) : null

  if (status.kind === 'sent') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        aria-labelledby="enquiry-sent-title"
        className="rounded-2xl border border-acid/40 bg-ink-850 p-6 shadow-lift outline-none sm:p-10"
      >
        <span className="grid size-12 place-items-center rounded-full bg-acid text-ink-950">
          <CheckIcon className="size-6" />
        </span>
        <h3 id="enquiry-sent-title" className="font-marker mt-5 text-4xl text-acid">
          Enquiry submitted
        </h3>
        <p className="mt-3 max-w-md text-lg text-haze">
          Thanks — your enquiry was submitted. Any reply will go to <strong className="text-paper">{status.email}</strong>.
        </p>
        <button type="button" onClick={() => setStatus({ kind: 'idle' })} className={buttonClasses('outline-acid', 'sm', 'mt-8')}>
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form
      id="enquiry-form"
      ref={formRef}
      method="post"
      action={ENQUIRY_API}
      tabIndex={-1}
      aria-labelledby="hire-me-title"
      aria-busy={sending}
      onSubmit={onSubmit}
      onFocusCapture={checkDelivery}
      className="relative rounded-2xl border border-white/10 bg-ink-850/95 p-5 shadow-lift outline-none sm:p-8"
    >
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {IS_STATIC_PREVIEW && status.kind !== 'problem' ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-eems-yellow/40 bg-eems-yellow/[0.07] p-4 text-sm text-haze">
          <InfoIcon className="mt-0.5 size-5 shrink-0 text-eems-yellow" />
          <div>
            <p className="font-semibold text-paper">Preview only: enquiries can’t be sent from this copy of the site.</p>
            <p className="mt-1">This online preview is static (no server), so the form can be tried out but won’t send anything.</p>
            {alternatives}
          </div>
        </div>
      ) : null}

      {!IS_STATIC_PREVIEW && delivery === 'off' && status.kind !== 'problem' ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-eems-yellow/40 bg-eems-yellow/[0.07] p-4 text-sm text-haze">
          <InfoIcon className="mt-0.5 size-5 shrink-0 text-eems-yellow" />
          <div>
            <p className="font-semibold text-paper">Online enquiries aren’t switched on yet.</p>
            <p className="mt-1">Email delivery for this form hasn’t been set up, so messages can’t be sent from here right now.</p>
            {alternatives}
          </div>
        </div>
      ) : null}

      {status.kind === 'invalid' && errorList.length ? (
        <div
          ref={alertRef}
          tabIndex={-1}
          aria-labelledby="enquiry-invalid-title"
          className="mb-6 rounded-xl border border-ember/60 bg-ember/[0.08] p-4 outline-none"
        >
          <p id="enquiry-invalid-title" className="flex items-center gap-2 font-semibold text-paper">
            <AlertIcon className="size-5 text-ember" />
            Some details need attention
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-haze">
            {errorList.map((field) => (
              <li key={field}>
                <a
                  href={`#${field === 'services' ? `${fieldId(field)}-${enquiryServiceOptions[0].id}` : fieldId(field)}`}
                  className="underline underline-offset-2 hover:text-paper"
                >
                  {LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status.kind === 'problem' ? (
        <div
          ref={alertRef}
          tabIndex={-1}
          aria-labelledby="enquiry-problem-title"
          className="mb-6 rounded-xl border border-ember/60 bg-ember/[0.08] p-4 outline-none"
        >
          <p id="enquiry-problem-title" className="flex items-center gap-2 font-semibold text-paper">
            <AlertIcon className="size-5 shrink-0 text-ember" />
            {status.title}
          </p>
          <p className="mt-1 text-sm text-haze">{status.message}</p>
          {status.offerAlternatives ? alternatives : null}
        </div>
      ) : null}

      <p className="mb-6 text-sm text-smoke">
        Fields marked <span className="text-acid">*</span> are required.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={fieldId('name')} label={LABELS.name} required error={errors.name}>
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={ENQUIRY_LIMITS.name.max}
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            onBlur={() => onBlur('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            className={inputClasses(Boolean(errors.name))}
          />
        </Field>
        <Field id={fieldId('email')} label={LABELS.email} required error={errors.email}>
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={ENQUIRY_LIMITS.email.max}
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            onBlur={() => onBlur('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            className={inputClasses(Boolean(errors.email))}
          />
        </Field>
      </div>

      <fieldset className="mt-7" aria-describedby={describedBy('services', true)}>
        <legend className="mb-1 text-sm font-semibold text-paper">
          {LABELS.services} <span aria-hidden="true" className="text-acid">*</span>
        </legend>
        <p id={`${fieldId('services')}-hint`} className="mb-3 text-sm text-smoke">
          Choose everything that applies.
        </p>
        <div className="flex flex-wrap gap-2">
          {enquiryServiceOptions.map((option) => {
            const checked = values.services.includes(option.id)
            return (
              <label
                key={option.id}
                className={cn(
                  'relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acid',
                  checked ? 'border-acid bg-acid text-ink-950' : 'border-white/20 text-haze hover:border-white/40 hover:text-paper',
                  errors.services && !checked && 'border-ember/70',
                )}
              >
                <input
                  id={`${fieldId('services')}-${option.id}`}
                  type="checkbox"
                  name="services"
                  value={option.id}
                  checked={checked}
                  onChange={(event) =>
                    update(
                      'services',
                      event.target.checked ? [...values.services, option.id] : values.services.filter((id) => id !== option.id),
                    )
                  }
                  aria-invalid={Boolean(errors.services)}
                  // Invisible but covering the whole pill, so taps and screen-reader activation hit the real control.
                  className="absolute inset-0 size-full cursor-pointer appearance-none rounded-full opacity-0"
                />
                <span
                  aria-hidden="true"
                  className={cn('grid size-4 place-items-center rounded-full border', checked ? 'border-ink-950 bg-ink-950 text-acid' : 'border-current')}
                >
                  {checked ? <CheckIcon className="size-3" strokeWidth={3} /> : null}
                </span>
                {option.name}
              </label>
            )
          })}
        </div>
        {errors.services ? <FieldError id={`${fieldId('services')}-error`} message={errors.services} /> : null}
      </fieldset>

      <div className="mt-7">
        <Field
          id={fieldId('details')}
          label={LABELS.details}
          required
          error={errors.details}
          hint={`What do you need, and what is it for? Up to ${ENQUIRY_LIMITS.details.max.toLocaleString('en-GB')} characters.`}
          aside={
            <span className="text-xs text-smoke tabular-nums" aria-hidden="true">
              {values.details.length.toLocaleString('en-GB')} / {ENQUIRY_LIMITS.details.max.toLocaleString('en-GB')}
            </span>
          }
        >
          <textarea
            id={fieldId('details')}
            name="details"
            required
            rows={6}
            minLength={ENQUIRY_LIMITS.details.min}
            maxLength={ENQUIRY_LIMITS.details.max}
            value={values.details}
            onChange={(event) => update('details', event.target.value)}
            onBlur={() => onBlur('details')}
            aria-invalid={Boolean(errors.details)}
            aria-describedby={describedBy('details', true)}
            className={cn(inputClasses(Boolean(errors.details)), 'min-h-40 resize-y')}
          />
        </Field>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <Field id={fieldId('budget')} label={LABELS.budget} error={errors.budget} hint="Any format — a range, a figure or “not sure yet”.">
          <input
            id={fieldId('budget')}
            name="budget"
            type="text"
            maxLength={ENQUIRY_LIMITS.budget.max}
            value={values.budget}
            onChange={(event) => update('budget', event.target.value)}
            onBlur={() => onBlur('budget')}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={describedBy('budget', true)}
            className={inputClasses(Boolean(errors.budget))}
          />
        </Field>
        <Field id={fieldId('timeframe')} label={LABELS.timeframe} error={errors.timeframe} hint="A date, a rough timeframe or “flexible”.">
          <input
            id={fieldId('timeframe')}
            name="timeframe"
            type="text"
            maxLength={ENQUIRY_LIMITS.timeframe.max}
            value={values.timeframe}
            onChange={(event) => update('timeframe', event.target.value)}
            onBlur={() => onBlur('timeframe')}
            aria-invalid={Boolean(errors.timeframe)}
            aria-describedby={describedBy('timeframe', true)}
            className={inputClasses(Boolean(errors.timeframe))}
          />
        </Field>
      </div>

      <div className="mt-7">
        <Field id={fieldId('references')} label={LABELS.references} error={errors.references} hint="Links to examples, one per line.">
          <textarea
            id={fieldId('references')}
            name="references"
            rows={3}
            maxLength={ENQUIRY_LIMITS.references.max}
            value={values.references}
            onChange={(event) => update('references', event.target.value)}
            onBlur={() => onBlur('references')}
            aria-invalid={Boolean(errors.references)}
            aria-describedby={describedBy('references', true)}
            className={cn(inputClasses(Boolean(errors.references)), 'resize-y')}
          />
        </Field>
      </div>

      {/* Spam trap: invisible to people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input ref={honeypotRef} id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={sending} aria-disabled={sending} className={buttonClasses('acid', 'md', 'min-w-52')}>
          {sending ? <Spinner className="size-4 animate-spin motion-reduce:animate-none" /> : null}
          <span>{sending ? 'Sending…' : 'Send enquiry'}</span>
          {sending ? null : <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />}
        </button>
        <p className="text-sm text-smoke" aria-live="polite">
          {sending ? 'Sending your enquiry — please keep this page open.' : null}
        </p>
      </div>
    </form>
  )
}

function inputClasses(invalid: boolean) {
  return cn(
    'block w-full rounded-lg border bg-ink-900 px-4 py-3 text-base text-paper transition-colors placeholder:text-smoke',
    'focus:border-acid focus:outline-2 focus:outline-offset-2 focus:outline-acid',
    invalid ? 'border-ember' : 'border-white/15 hover:border-white/30',
  )
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-ember">
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>
        <span className="sr-only">Error: </span>
        {message}
      </span>
    </p>
  )
}

function Field({
  id,
  label,
  required = false,
  hint,
  error,
  aside,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-paper">
          {label}
          {required ? (
            <span aria-hidden="true" className="text-acid">
              {' '}
              *
            </span>
          ) : (
            <span className="font-normal text-smoke"> (optional)</span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-sm text-smoke">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={`${id}-error`} message={error} /> : null}
    </div>
  )
}
