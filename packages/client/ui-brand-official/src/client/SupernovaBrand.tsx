import type { HeroBrandMarkOwnerProps } from '@supernova-ai/snh-client-ui-conversation/client'
import type { SidebarBrandMarkOwnerProps } from '@supernova-ai/snh-client-ui-sidebar/client'
import supernovaMarkUrl from './assets/supernova-mark.png'

/** Symbol-only Supernova brand mark. No wordmark or lettering is rendered. */
export function SupernovaMark({ size }: SidebarBrandMarkOwnerProps) {
  return (
    <img
      src={supernovaMarkUrl}
      width={size}
      height={size}
      alt="APT Supernova"
      draggable={false}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}

/** Deliberately suppress all brand lettering in the sidebar. */
export function SupernovaName() {
  return null
}

/**
 * Supernova mark in front of the blank-session headline, replacing the default hero logo.
 * @param props - requested square edge and the host class that keeps the surrounding mark geometry.
 * @returns the decorative mark image.
 */
export function SupernovaHeroMark({ size, className }: HeroBrandMarkOwnerProps) {
  return (
    <img
      src={supernovaMarkUrl}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
