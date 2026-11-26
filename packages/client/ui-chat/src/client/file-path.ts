/** Gesture-time path resolution for Chat-owned file references. */
import type { Context } from '@supernova-ai/cordis'
import type { SessionId } from '@supernova-ai/snh-session/types'
import { resolveWorkspacePath } from '@supernova-ai/snh-util-workspace-path'
import { sessionDirectory } from '@supernova-ai/snh-api-session-controller/client/directories'

/**
 * Bind path resolution to the originating Session without capturing its current directory.
 * @param ctx - Chat plugin context.
 * @param sessionId - Original Session identity.
 * @returns Resolver using the live working directory, falling back to the workspace root.
 */
export function sessionFilePath(ctx: Context, sessionId: SessionId): (path: string) => string {
  return path => resolveWorkspacePath(sessionDirectory(ctx.sessions, sessionId), path)
}
