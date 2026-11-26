/** Shared Host wiring for the SuperNova protocol adapter. */
import type { Context } from '@supernova-ai/cordis'
import type {} from '@supernova-ai/snh-settings'
import type {} from '@supernova-ai/cordis-plugin-loader'
import type {} from '@supernova-ai/snh-fs'
import { resolveImageAttachmentAccess } from '@supernova-ai/snh-llm'
import { getOrCreateAnonymousUserId, type AnonymousUserId } from '@supernova-ai/snh-anonymous-user-id'
import { deepEqualJson } from '@supernova-ai/snh-util-values'
import { SuperNovaAdapter } from './adapter.ts'
import type { SuperNovaAdapterOptions, SuperNovaConnectionOptions } from './types.ts'
import { requestModelListing } from './listing.ts'
import { ModelListingCache, type ListingCacheDependencies } from './listing-cache.ts'

/**
 * Own a route's listing refreshes, stderr diagnostics, and catalog-change notifications.
 * @param ctx - provider plugin lifetime.
 * @param owner - plugin name used in diagnostics.
 * @param provider - route whose catalog changes.
 * @param dependencies - current configuration and credential headers; `load` defaults to the official `/models` request.
 * @returns the cache, disposed with the provider after its active work settles.
 */
export function createModelListingCache(
  ctx: Context, owner: string, provider: string,
  dependencies: Pick<ListingCacheDependencies, 'settings' | 'credential'> & Partial<Pick<ListingCacheDependencies, 'load'>>,
): ModelListingCache {
  const tag = `[${owner}]`
  const cache = new ModelListingCache({
    ...dependencies,
    load: dependencies.load ?? requestModelListing,
    now: () => Date.now(),
    // ACP reserves stdout for protocol messages, including during successful catalog loads.
    info: (message) => { console.error(tag, message) },
    warn: (message) => { console.warn(tag, message) },
    changed: () => { ctx.emit('llm/models-updated', provider) },
  })
  ctx.effect(() => () => cache.dispose(), `${owner}: model listing`)
  return cache
}

/**
 * Register one provider with request-local transport services and live retry policy.
 * @param ctx - provider plugin lifetime with the LLM registry injected.
 * @param provider - exact route owned by this plugin.
 * @param dependencies - provider-owned discovery, credential, and configuration callbacks.
 */
export function registerSuperNovaProvider<C extends SuperNovaConnectionOptions>(
  ctx: Context, provider: string, dependencies: Pick<SuperNovaAdapterOptions<C>,
  'options' | 'resolveAuth' | 'missingCredential' | 'providerName' | 'discoverModels' | 'connect' | 'admit'>): void {
  ctx.inject(['settings'], (child) => { child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)) })
  let userId: AnonymousUserId | undefined
  // These conditions repeat on every request of a route; log each first occurrence only.
  const degradedReplays = new Set<string>()
  const omittedRoutes = new Set<string>()
  const unacceptedRoutes = new Set<string>()
  const adapter = new SuperNovaAdapter({
    ...dependencies,
    resolveUserId: () => userId ??= getOrCreateAnonymousUserId(),
    onReplayDegrade: ({ provider, model, reason }) => {
      const key = `${provider}/${model}\u0000${reason}`
      if (degradedReplays.has(key)) return
      degradedReplays.add(key)
      ctx.logger.warn(`llm-supernova: unusable Messages replay state on assistant history for route "${provider}/${model}"; sending provider-neutral content (${reason})`)
    },
    onExtensionsOmitted: ({ provider, model, fields, error }) => {
      const route = `${provider}/${model}`
      if (omittedRoutes.has(route)) return
      omittedRoutes.add(route)
      ctx.logger.warn(`llm-supernova: sending route "${route}" without request extension fields ${fields.join(', ')} because they failed to serialize: %o`, error)
    },
    onExtensionsUnaccepted: ({ provider, model, error }) => {
      const route = `${provider}/${model}`
      if (unacceptedRoutes.has(route)) return
      unacceptedRoutes.add(route)
      ctx.logger.warn(`llm-supernova: route "${route}" request extension acceptance failed; contributors resend on a later request: %o`, error)
    },
    resolveAttachments: () => ctx.get('attachments'),
    resolveImageAccess: (attachments, ref) => resolveImageAttachmentAccess(
      attachments, hostPath => ctx.get('fs')?.processPathFromHostPath(hostPath), ref,
    ),
    prepareExtensions: request => ctx.get('supernovaLlmApiExtensions')?.prepare(request)
      ?? Promise.resolve({ fields: {}, accept: () => Promise.resolve() }),
  })
  const registration = ctx.llm.registerAdapter([provider], adapter)
  let registeredPolicy = dependencies.options().retryPolicy
  ctx.on('loader/volatile-update', () => {
    let policy: typeof registeredPolicy
    try { policy = dependencies.options().retryPolicy }
    catch (error) { ctx.logger.warn(error); return }
    if (deepEqualJson(policy, registeredPolicy)) return
    registration.replace([provider])
    registeredPolicy = policy
  })
}
