/**
 * Moves keyboard focus to a section after in-page navigation from inside a
 * modal (menu or viewer), so the next Tab continues from the destination.
 * Scrolling is left to the link's normal fragment navigation.
 */
export function focusSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
