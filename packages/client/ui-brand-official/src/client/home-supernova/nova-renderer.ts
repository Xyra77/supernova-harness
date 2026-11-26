/** Supernova atlas renderer. R = dot radius; G = shadow/opacity; B = plasma color band. */
import type { NovaArtwork } from './nova-artwork.ts'

const ATLAS = { width: 192, height: 192, columns: 12, frames: 137 } as const

export interface SupernovaHandle {
  play: () => void
  dispose: () => void
}

const NOOP: SupernovaHandle = { play: () => {}, dispose: () => {} }

type FrameDots = Float32Array[]

const PALETTE = ['#841329', '#f42b3c', '#ff7b3f', '#fff3dd'] as const
const OPACITY_BANDS = [0.28, 0.48, 0.70, 0.94] as const

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

function decodeAtlas(pixels: Uint8ClampedArray): FrameDots[] {
  const frames: FrameDots[] = []
  const stride = ATLAS.width * ATLAS.columns
  for (let frame = 0; frame < ATLAS.frames; frame++) {
    const groups: number[][] = Array.from({ length: 16 }, () => [])
    const offsetX = (frame % ATLAS.columns) * ATLAS.width
    const offsetY = Math.floor(frame / ATLAS.columns) * ATLAS.height
    for (let y = 0; y < ATLAS.height; y++) {
      for (let x = 0; x < ATLAS.width; x++) {
        const offset = ((offsetY + y) * stride + offsetX + x) * 4
        const radiusCode = pixels[offset] as number
        const opacityCode = pixels[offset + 1] as number
        if (opacityCode < 12 || radiusCode < 5) continue
        const opacityBand = Math.min(3, Math.floor(opacityCode / 64))
        const colorCode = pixels[offset + 2] as number
        const heatBand = Math.min(3, Math.floor(colorCode / 64))
        groups[opacityBand * 4 + heatBand]?.push(x + 0.5, y + 0.5, Math.max(0.42, radiusCode / 255 * 1.28))
      }
    }
    frames.push(groups.map(group => Float32Array.from(group)))
  }
  return frames
}

/** Attach one click-triggered, one-shot Supernova burst to a host-owned canvas. */
export function attachSupernova(canvas: HTMLCanvasElement, options: NovaArtwork, atlasUrl: string): SupernovaHandle {
  const context = canvas.getContext('2d')
  if (context === null) return NOOP
  const ctx = context
  const image = new Image()
  const media = matchMedia('(prefers-reduced-motion: reduce)')
  let frames: FrameDots[] | undefined
  let started: number | undefined
  let loading = false
  let failed = false
  let disposed = false
  let visible = true
  let raf = 0
  let layoutRaf = 0
  let lastPaint = -Infinity
  let width = 0
  let height = 0
  let sceneWidth = 0
  let left = 0
  let top = 0

  const drawable = () => !disposed && !document.hidden && visible && width > 0 && height > 0
  const playing = (): boolean => started !== undefined
  const clear = (): void => { ctx.clearRect(0, 0, width, height) }

  function stop(): void {
    cancelAnimationFrame(raf)
    raf = 0
    started = undefined
    clear()
  }

  function fail(error: unknown): void {
    if (disposed) return
    failed = true
    stop()
    console.warn('Supernova home animation is unavailable; home remains usable.', error)
  }

  function paint(now: number): void {
    clear()
    if (frames === undefined || started === undefined) return
    const progress = (now - started) / options.durationMs
    if (progress >= 1) { started = undefined; return }
    const index = Math.min(ATLAS.frames - 1, Math.floor(clamp(progress) * ATLAS.frames))
    const fadeIn = clamp(progress / 0.055)
    const fadeOut = clamp((1 - progress) / 0.12)
    const fade = Math.min(1, fadeIn, fadeOut) * options.activeOpacity
    const dots = frames[index]
    if (dots === undefined) return
    const cell = sceneWidth / ATLAS.width

    ctx.save()
    ctx.translate(left, top)
    ctx.globalCompositeOperation = 'lighter'
    for (let opacityBand = 0; opacityBand < 4; opacityBand++) {
      const opacity = OPACITY_BANDS[opacityBand] as number
      for (let heatBand = 0; heatBand < 4; heatBand++) {
        const group = dots[opacityBand * 4 + heatBand]
        if (group === undefined || group.length === 0) continue
        ctx.beginPath()
        for (let i = 0; i < group.length; i += 3) {
          const x = (group[i] as number) * cell
          const y = (group[i + 1] as number) * cell
          const r = (group[i + 2] as number) * cell
          ctx.moveTo(x + r, y)
          ctx.arc(x, y, r, 0, Math.PI * 2)
        }
        ctx.globalAlpha = fade * opacity
        ctx.fillStyle = PALETTE[heatBand] as string
        ctx.shadowColor = PALETTE[heatBand] as string
        ctx.shadowBlur = heatBand >= 2 ? cell * 2.2 : cell * 1.05
        ctx.fill()
      }
    }
    ctx.restore()
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.shadowBlur = 0
  }

  function tick(now: number): void {
    raf = 0
    if (!drawable() || started === undefined) return
    if (now - lastPaint + 0.5 >= 1000 / options.frameRate) {
      paint(now)
      lastPaint = now
    }
    if (playing()) raf = requestAnimationFrame(tick)
  }

  function resume(): void {
    cancelAnimationFrame(raf)
    raf = 0
    if (!drawable() || started === undefined) return
    if (media.matches) {
      paint(started + options.durationMs * 0.46)
      started = undefined
      return
    }
    tick(performance.now())
  }

  function resize(): void {
    width = canvas.clientWidth
    height = canvas.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // Keep a square render field so the tilted orbital ellipse and radial ejecta retain their intended proportions.
    sceneWidth = Math.min(width * 0.86, height * 0.86, 860)
    const sceneHeight = sceneWidth
    left = (width - sceneWidth) / 2
    top = (height - sceneHeight) / 2
    if (started !== undefined) resume()
    else clear()
  }

  function scheduleResize(): void {
    if (disposed || layoutRaf !== 0) return
    layoutRaf = requestAnimationFrame(() => { layoutRaf = 0; resize() })
  }

  function begin(): void {
    if (frames === undefined || !drawable()) return
    started = performance.now()
    lastPaint = -Infinity
    resume()
  }

  image.onload = () => {
    if (disposed) return
    const source = document.createElement('canvas')
    source.width = image.naturalWidth
    source.height = image.naturalHeight
    try {
      if (source.width !== ATLAS.width * ATLAS.columns
        || source.height !== ATLAS.height * Math.ceil(ATLAS.frames / ATLAS.columns)) {
        throw new Error(`Supernova atlas dimensions must be ${ATLAS.width * ATLAS.columns}×${ATLAS.height * Math.ceil(ATLAS.frames / ATLAS.columns)}`)
      }
      const reader = source.getContext('2d', { willReadFrequently: true })
      if (reader === null) { fail(new Error('Supernova atlas Canvas context is unavailable')); return }
      reader.drawImage(image, 0, 0)
      frames = decodeAtlas(reader.getImageData(0, 0, source.width, source.height).data)
    } catch (error) {
      fail(error)
      return
    } finally {
      source.width = source.height = 0
      image.removeAttribute('src')
    }
    begin()
  }
  image.onerror = () => { fail(new Error('Supernova atlas could not be decoded')) }

  function play(): void {
    if (failed || !drawable() || started !== undefined) return
    if (frames !== undefined) { begin(); return }
    if (loading) return
    loading = true
    image.src = atlasUrl
  }

  const sizeObserver = new ResizeObserver(scheduleResize)
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    resume()
  })
  sizeObserver.observe(canvas)
  visibilityObserver.observe(canvas)
  document.addEventListener('visibilitychange', resume)
  media.addEventListener('change', resume)
  resize()

  function dispose(): void {
    disposed = true
    stop()
    cancelAnimationFrame(layoutRaf)
    image.onload = image.onerror = null
    image.removeAttribute('src')
    frames = undefined
    sizeObserver.disconnect()
    visibilityObserver.disconnect()
    document.removeEventListener('visibilitychange', resume)
    media.removeEventListener('change', resume)
    canvas.width = canvas.height = 0
  }

  return { play, dispose }
}
