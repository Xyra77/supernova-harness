/** Bind the source-owned permission UI to its generated Remote contribution. */
import type { Context } from '@supernova-ai/cordis'
import cuaRemote from '@supernova-ai/snh-cua/remote'
import { mountCuaPermissions } from './mount.ts'

export { inject } from './mount.ts'

/**
 * Activate the optional Computer Use permission controls.
 * @param ctx Browser plugin context.
 * @returns Cleanup of the UI and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  return mountCuaPermissions(ctx, cuaRemote)
}
