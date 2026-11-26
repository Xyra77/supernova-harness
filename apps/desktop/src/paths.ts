/** Filesystem ownership for the Electron-managed desktop installation. */

import { join } from 'node:path'
import { resolveSnhHome } from '@supernova-ai/snh-home-paths'

/** Stable desktop installation paths under the shared Harness home. */
export interface DesktopPaths {
  readonly profile: string
  readonly lock: string
}

/**
 * Resolve every Electron-owned path without changing the shared data roots.
 * @param snhHome - Harness home shared with npm-installed snh.
 * @returns immutable desktop path set.
 */
export function resolveDesktopPaths(snhHome: string = resolveSnhHome()): DesktopPaths {
  return {
    profile: join(snhHome, 'profiles', 'desktop'),
    lock: join(snhHome, 'profiles', 'desktop', 'lock'),
  }
}
