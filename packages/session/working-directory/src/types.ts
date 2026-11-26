/**
 * Import-free type declarations of the `workingDirectory` Session projection, for Client programs that read it.
 * @module @supernova-ai/snh-working-directory/types
 */

import type {} from '@supernova-ai/snh-session-projection/types'

declare module '@supernova-ai/snh-session-projection/types' {
  interface SessionProjectionMap {
    /** Recorded directory of the Session for observations, or null when none is recorded. */
    workingDirectory: string | null
  }
}
