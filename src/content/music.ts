/**
 * Tracks embedded from https://soundcloud.com/eems420 with SoundCloud's
 * official player. Titles and ids come from SoundCloud's oEmbed endpoint.
 *
 * To change the selection: copy the track's link from SoundCloud, get its id
 * from SoundCloud's embed code ("tracks/<id>"), and edit this list. Uploads
 * marked as drafts, tests or snippets are deliberately left out.
 */
import type { SoundCloudTrack } from './types'

export const soundcloudProfileUrl = 'https://soundcloud.com/eems420'

export const tracks: SoundCloudTrack[] = [
  { title: 'Follow Me Down', url: 'https://soundcloud.com/eems420/followmedownos', trackId: '2328380822' },
  { title: 'Hunger', url: 'https://soundcloud.com/eems420/hunger', trackId: '2328380321' },
  { title: 'Made of Glass', url: 'https://soundcloud.com/eems420/untitled', trackId: '2180221011' },
  { title: 'I Don’t Mind', url: 'https://soundcloud.com/eems420/i-dont-mind', trackId: '1856574195' },
  { title: 'Frantic', url: 'https://soundcloud.com/eems420/frantic-1', trackId: '1844244132' },
]

/** SoundCloud's API URL for a track, as used by its embed player. */
export const soundcloudApiUrl = (track: SoundCloudTrack) => `https://api.soundcloud.com/tracks/${track.trackId}`

/**
 * Official SoundCloud embed player URL. The player is only created after a
 * visitor presses play, so `autoPlay` just continues that deliberate action.
 */
export function soundcloudEmbedSrc(track: SoundCloudTrack, { autoPlay }: { autoPlay: boolean }): string {
  const params = new URLSearchParams({
    url: soundcloudApiUrl(track),
    color: '#9dfb58',
    auto_play: String(autoPlay),
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  })
  return `https://w.soundcloud.com/player/?${params.toString()}`
}
