/** Home frame layer for the text-free Supernova burst. */
import { useCallback, useRef, type MouseEvent, type ReactNode } from 'react'
import type { HeroFrameOwnerProps } from '@supernova-ai/snh-client-ui-conversation/client'
import atlasUrl from '../assets/supernova-atlas.webp'
import { SUPERNOVA_ARTWORK } from './nova-artwork.ts'
import { attachSupernova, type SupernovaHandle } from './nova-renderer.ts'
import css from './PixelNova.module.css'

const CONTROLS = 'button, a, input, textarea, select, label, [contenteditable], [role="button"], [role="dialog"], [role="menu"], [role="listbox"], [data-composer-card]'

export type PixelNovaProps = HeroFrameOwnerProps & { children: ReactNode }

function isBlankClick(event: MouseEvent<HTMLDivElement>): boolean {
  const target = event.target as Element
  const frame = event.currentTarget
  const selection = window.getSelection()
  return event.button === 0
    && frame.contains(target)
    && target.closest(CONTROLS) === null
    && !(selection !== null && !selection.isCollapsed && frame.contains(selection.anchorNode))
}

export function PixelNova({ hero, children }: PixelNovaProps) {
  const nova = useRef<SupernovaHandle | undefined>(undefined)
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    nova.current?.dispose()
    nova.current = canvas === null ? undefined : attachSupernova(canvas, SUPERNOVA_ARTWORK, atlasUrl)
  }, [])
  const onClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (nova.current !== undefined && isBlankClick(event)) nova.current.play()
  }

  return (
    <div className={css.layer} onClick={onClick}>
      {hero && <canvas ref={canvasRef} className={css.canvas} data-home-supernova="" aria-hidden="true" />}
      {children}
    </div>
  )
}
