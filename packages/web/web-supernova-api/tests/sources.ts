/** Credential sources for provider tests that construct a provider or a request directly. */
import { credentialRef } from '@supernova-ai/snh-credentials'
import type { SuperNovaAuthCandidate } from '@supernova-ai/snh-supernova-auth'

/**
 * An API-key candidate bound to `endpoint`, as `ctx.supernovaAuth` binds one: it releases `key` as a bearer token and
 * releases nothing for an empty key.
 * @param endpoint - absolute URL the operation dispatches to.
 * @param key - the key; empty means none is configured.
 * @param reference - the credential reference the candidate names.
 * @returns the candidate.
 */
export function keyCandidate(endpoint: string, key: string, reference = 'TEST_KEY'): SuperNovaAuthCandidate {
  const ref = credentialRef(reference)
  return {
    kind: 'api-key', endpoint, reference: ref,
    configured: async () => key.length > 0,
    resolve: async () => key.length > 0 ? { kind: 'api-key', endpoint, reference: ref, headers: { authorization: `Bearer ${key}` } } : undefined,
  }
}
