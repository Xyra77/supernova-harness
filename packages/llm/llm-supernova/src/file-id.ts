/** SuperNova Files API identifiers. @module snh-llm-supernova/file-id */

import type { Branded } from '@supernova-ai/snh-brand'

/** Opaque identifier returned by the SuperNova Files API. */
export type SuperNovaFileId = Branded<'SuperNovaFileId'>

/**
 * Brand a provider-returned file identifier after wire validation.
 * @param id - non-empty Files API identifier.
 * @returns the same string with its provider identity attached at type level.
 */
export function SuperNovaFileId(id: string): SuperNovaFileId {
  return id as SuperNovaFileId
}

/** Non-secret digest identifying one endpoint and API-key file namespace. */
export type SuperNovaFileScope = Branded<'SuperNovaFileScope'>

/**
 * Brand a locally derived namespace digest.
 * @param scope - SHA-256 digest of endpoint and API key.
 * @returns the same string with namespace identity attached at type level.
 */
export function SuperNovaFileScope(scope: string): SuperNovaFileScope {
  return scope as SuperNovaFileScope
}
