import type { JSX, SVGProps } from 'react'

import type { SocialPlatform } from '@/content/types'

type IconProps = SVGProps<SVGSVGElement>

/** Decorative icons: always paired with visible or screen-reader text. */
function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
)

export const ArrowUpRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M7 17 17 7M9 7h8v8" />
  </Svg>
)

export const ArrowLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Svg>
)

export const ChevronLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="m15 5-7 7 7 7" />
  </Svg>
)

export const ChevronRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
)

export const Headphones = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
    <rect x="3" y="14" width="4.5" height="7" rx="1.6" />
    <rect x="16.5" y="14" width="4.5" height="7" rx="1.6" />
  </Svg>
)

export const MenuIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 7h16M4 12h16M4 17h11" />
  </Svg>
)

export const CloseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)

export const AlertIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
    <path d="M12 10v4.2M12 17.2v.1" />
  </Svg>
)

export const InfoIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.1" />
  </Svg>
)

export const MailIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
)

export const Spinner = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </Svg>
)

export const InstagramIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </Svg>
)

export const TikTokIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.8-3.8" />
    <path d="M14 3.5c.4 2.8 2.4 4.7 5.2 4.9" />
  </Svg>
)

export const SoundCloudIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2.5 14.5v3M5.5 12v5.5M8.5 10.5v7" />
    <path d="M11.5 8.6V17.5h6.8a3.2 3.2 0 0 0 .4-6.4 5 5 0 0 0-7.2-2.5Z" />
  </Svg>
)

export const SpotifyIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M7.2 9.4c3.4-1 6.9-.7 9.8.9M7.9 12.5c2.7-.7 5.4-.4 7.7.8M8.6 15.4c2-.5 3.9-.3 5.6.6" />
  </Svg>
)

export const YouTubeIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="m10.3 9.4 4.6 2.6-4.6 2.6V9.4Z" fill="currentColor" />
  </Svg>
)

export const platformIcons: Record<SocialPlatform, (props: IconProps) => JSX.Element> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  soundcloud: SoundCloudIcon,
  spotify: SpotifyIcon,
  youtube: YouTubeIcon,
}
