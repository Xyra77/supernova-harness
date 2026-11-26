/** Timing and intensity for the text-free Supernova burst. */
export interface NovaArtwork {
  /** One click's total lifetime, in milliseconds. */
  durationMs: number
  /** Maximum canvas redraw frequency. */
  frameRate: number
  /** Opacity multiplier applied to the green atlas mask. */
  activeOpacity: number
}

export const SUPERNOVA_ARTWORK: NovaArtwork = {
  durationMs: 5400,
  frameRate: 26,
  activeOpacity: 0.92,
}
