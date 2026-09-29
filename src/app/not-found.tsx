import { EemojiSticker } from '@/components/eemoji/EemojiSticker'
import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <div className="shell grid min-h-[70vh] place-items-center py-20 text-center">
        <div className="max-w-lg">
          <EemojiSticker className="mx-auto w-40" sizes="160px" />
          <h1 className="font-marker mt-6 text-5xl text-paper">Page not found</h1>
          <p className="mt-4 text-lg text-haze">That page doesn’t exist. The music, merch and art are all a click away.</p>
          <ButtonLink href="/" clientNav variant="acid" className="mt-8">
            Back home
          </ButtonLink>
        </div>
      </div>
    </main>
  )
}
