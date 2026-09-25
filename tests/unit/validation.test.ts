import { describe, expect, it } from 'vitest'

import { ENQUIRY_LIMITS, errorsFor, validateEnquiry } from '@/lib/enquiry/validation'

const valid = {
  name: '  Test   Visitor ',
  email: 'visitor@example.com',
  services: ['motion-graphics', 'visual-effects'],
  details: 'Animated logo intro for a music video.\r\nAround ten seconds.',
  budget: '',
  timeframe: 'flexible',
  references: '',
}

describe('validateEnquiry', () => {
  it('accepts a complete enquiry and normalises whitespace and line endings', () => {
    const result = validateEnquiry(valid)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.name).toBe('Test Visitor')
    expect(result.data.details).toBe('Animated logo intro for a music video.\nAround ten seconds.')
    expect(result.data.services).toEqual(['motion-graphics', 'visual-effects'])
  })

  it('reports every missing required field', () => {
    const result = validateEnquiry({})
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual(['details', 'email', 'name', 'services'])
  })

  it('treats non-object input as empty', () => {
    expect(validateEnquiry(null).ok).toBe(false)
    expect(validateEnquiry('name=x').ok).toBe(false)
  })

  it.each(['plainaddress', 'no-at.example.com', 'a@b', 'a@b.c', 'two@@example.com', 'x y@example.com', 'a@example.com, b@example.com', '"q"@example.com'])(
    'rejects the invalid email %s',
    (email) => {
      const result = validateEnquiry({ ...valid, email })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.errors.email).toBeDefined()
    },
  )

  it('collapses line breaks in single-line fields so they cannot inject email headers', () => {
    const result = validateEnquiry({ ...valid, name: 'Eve\r\nBcc: victim@example.com' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.name).toBe('Eve Bcc: victim@example.com')
  })

  it('strips control characters', () => {
    const result = validateEnquiry({ ...valid, details: 'Hello\u0000 there\u0007, more text here' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.details).toBe('Hello there, more text here')
  })

  it('rejects unknown services and de-duplicates known ones', () => {
    const bad = validateEnquiry({ ...valid, services: ['motion-graphics', 'free-money'] })
    expect(bad.ok).toBe(false)
    const dupes = validateEnquiry({ ...valid, services: ['video-editing', 'video-editing'] })
    expect(dupes.ok).toBe(true)
    if (dupes.ok) expect(dupes.data.services).toEqual(['video-editing'])
  })

  it('accepts a single service given as a string (form posts)', () => {
    const result = validateEnquiry({ ...valid, services: 'other' })
    expect(result.ok).toBe(true)
  })

  it('enforces length limits', () => {
    const long = (n: number) => 'x'.repeat(n)
    const result = validateEnquiry({
      ...valid,
      name: long(ENQUIRY_LIMITS.name.max + 1),
      details: long(ENQUIRY_LIMITS.details.max + 1),
      budget: long(ENQUIRY_LIMITS.budget.max + 1),
      timeframe: long(ENQUIRY_LIMITS.timeframe.max + 1),
      references: long(ENQUIRY_LIMITS.references.max + 1),
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual(['budget', 'details', 'name', 'references', 'timeframe'])
  })

  it('requires a minimum amount of project detail', () => {
    const result = validateEnquiry({ ...valid, details: 'hi' })
    expect(result.ok).toBe(false)
  })
})

describe('errorsFor', () => {
  it('returns only the requested fields', () => {
    expect(errorsFor(['email'], { ...valid, email: 'nope', name: '' })).toEqual({
      email: 'Please enter a valid email address, like name@example.com.',
    })
    expect(errorsFor(['email'], valid)).toEqual({})
  })
})
