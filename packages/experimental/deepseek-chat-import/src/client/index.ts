/** Browser half: the import action after New session and its Remote calls. */
import type { Context } from '@supernova-ai/cordis'
import remote from '@supernova-ai/snh-deepseek-chat-import/remote'
import { mountImport } from './mount.ts'
import type { SupernovaChatImportKey } from './locales.ts'

export { inject } from './mount.ts'
export type { SupernovaChatImportInjected, SupernovaChatImportOutcome, ImportSessionsActionProps } from './ImportSessions.tsx'
export type { SupernovaChatImportKey } from './locales.ts'

declare module '@supernova-ai/snh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** SuperNova chat export import action and dialog copy. */
    supernovaChatImport: SupernovaChatImportKey
  }
}

/**
 * Mount the import action and its Remote methods.
 * @param ctx - browser plugin context.
 * @returns disposer joining UI and Remote withdrawal.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  return await mountImport(ctx, remote)
}
