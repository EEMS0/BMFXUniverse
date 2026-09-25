import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <div className="shell grid min-h-[70vh] place-items-center py-20 text-center">
        <div className="max-w-lg">
          <ArtImage id="eemojiWorried" decorative sizes="160px" className="mx-auto h-auto w-40" />
          <h1 className="font-marker mt-6 text-5xl text-paper">Page not found</h1>
          <p className="mt-4 text-lg text-haze">That page doesn’t exist. The work, music and enquiry form are all on the home page.</p>
          <ButtonLink href="/" clientNav variant="acid" className="mt-8">
            Back home
          </ButtonLink>
        </div>
      </div>
    </main>
  )
}
