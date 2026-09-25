/**
 * Deployment-dependent paths.
 *
 * NEXT_PUBLIC_BASE_PATH is set when the site is served from a sub-folder, e.g.
 * a GitHub Pages project site at https://<user>.github.io/<repo>. next/link and
 * next/image add it automatically; plain <a> elements, form actions and fetch()
 * calls must use `withBase()`.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')

export const withBase = (path: string) => (path.startsWith('/') ? `${BASE_PATH}${path}` : path)

/**
 * True for the static GitHub Pages preview (next build with `output: 'export'`).
 * There is no server there, so the enquiry API does not exist and the form says so.
 */
export const IS_STATIC_PREVIEW = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'static-preview'

/** Href of a project page for plain <a> elements (the static preview uses trailing slashes). */
export const workHref = (slug: string) => withBase(IS_STATIC_PREVIEW ? `/work/${slug}/` : `/work/${slug}`)
