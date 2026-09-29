/**
 * Deployment-dependent paths.
 *
 * NEXT_PUBLIC_BASE_PATH is set when the site is served from a sub-folder, e.g.
 * a GitHub Pages project site at https://<user>.github.io/<repo>. next/link and
 * next/image add it automatically; plain <a> elements must use `withBase()`.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')

export const withBase = (path: string) => (path.startsWith('/') ? `${BASE_PATH}${path}` : path)

/** True for static-export builds (e.g. GitHub Pages), which use trailing slashes on pages. */
export const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'static'

/** Href of a page for plain <a> elements, e.g. pageHref('/merch'). */
export const pageHref = (path: string) => withBase(IS_STATIC_EXPORT && path !== '/' ? `${path.replace(/\/$/, '')}/` : path)

/** Href of a project page for plain <a> elements. */
export const workHref = (slug: string) => pageHref(`/work/${slug}`)
