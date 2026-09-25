/**
 * BMFX services. The `id`s are shared with the enquiry form and the server-side
 * validation, so "Enquire about …" links can preselect the matching checkbox.
 * Keep descriptions neutral: no prices, packages, turnaround times or guarantees.
 */
import type { Service, ServiceId } from './types'

export const services: Service[] = [
  {
    id: 'graphic-design',
    name: 'Graphic design',
    summary: 'Artwork, logos, covers, posters and graphics for screens and print.',
  },
  {
    id: 'motion-graphics',
    name: 'Motion graphics',
    summary: 'Animated titles, logos and graphics that give still designs movement.',
  },
  {
    id: 'video-editing',
    name: 'Video editing',
    summary: 'Cutting, pacing and finishing footage into a complete edit.',
  },
  {
    id: 'visual-effects',
    name: 'Visual effects',
    summary: 'Compositing and effects work for video and still images.',
  },
]

/** Extra enquiry option for work that does not fit a listed service. */
export const OTHER_SERVICE = { id: 'other', name: 'Something else / not sure' } as const

export type EnquiryServiceId = ServiceId | typeof OTHER_SERVICE.id

export const enquiryServiceOptions: { id: EnquiryServiceId; name: string }[] = [
  ...services.map(({ id, name }) => ({ id, name })),
  OTHER_SERVICE,
]

export const enquiryServiceIds = enquiryServiceOptions.map((option) => option.id)

export function isEnquiryServiceId(value: unknown): value is EnquiryServiceId {
  return typeof value === 'string' && (enquiryServiceIds as string[]).includes(value)
}

export function serviceName(id: EnquiryServiceId): string {
  return enquiryServiceOptions.find((option) => option.id === id)?.name ?? id
}
