/**
 * Playable music. Empty on purpose: no audio files or embeds have been supplied.
 * The site shows no player, play button, waveform or duration until a real
 * track is added here, e.g.
 *
 *   { title: 'Track name', audio: { src: '/audio/track-name.mp3', type: 'audio/mpeg' } }
 *   { title: 'Track name', embed: { provider: 'soundcloud', src: '<official embed URL>', height: 166 } }
 */
import type { ArtworkId, Track } from './types'

export const tracks: Track[] = []

/** Supplied music-related artwork shown in the Music section. */
export const musicArtwork: { artwork: ArtworkId; projectSlug: string; caption: string }[] = [
  { artwork: 'symptoms', projectSlug: 'symptoms', caption: 'SYMPTOMS — artwork' },
  { artwork: 'eemsAtmosphere', projectSlug: 'eems-glow', caption: 'EEMS — artwork' },
]

/** Tracks that can actually be played (a real file or an embed is configured). */
export function playableTracks(list: Track[] = tracks): Track[] {
  return list.filter((track) => Boolean(track.audio?.src || track.embed?.src))
}
