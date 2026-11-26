/** Provider-specific JSON and contribution types for SuperNova request extensions. */

/** Lossless JSON value accepted by the SuperNova request body. */
export type SuperNovaLlmApiJson =
  | null
  | boolean
  | number
  | string
  | SuperNovaLlmApiJson[]
  | { [key: string]: SuperNovaLlmApiJson }

/**
 * Merge-extensible table of top-level SuperNova request extension fields.
 * Contributor packages declaration-merge the field they own.
 */
export interface SuperNovaLlmApiExtensionMap {}

/** Exact serialized request facts visible to extension providers. */
export interface SuperNovaLlmApiExtensionRequest {
  /** Base SuperNova request body before extension fields are merged. */
  readonly body: Readonly<Record<string, SuperNovaLlmApiJson>>
  /** Session identity carried by the model request, when present. */
  readonly sessionId?: string
  /** Auxiliary request classification, when present. */
  readonly purpose?: string
  /** Cancellation for request preparation; providers must stop promptly after abort. */
  readonly signal: AbortSignal
}

/** One prepared field value and its optional post-2xx commit. */
export interface PreparedSuperNovaLlmApiExtension<T extends SuperNovaLlmApiJson> {
  /** Detached value merged under the provider's registered field. */
  readonly value: T
  /** Commit state that depends on confirmed provider acceptance. */
  accept?(): void | Promise<void>
}

/** Provider registered under one key of {@link SuperNovaLlmApiExtensionMap}. */
export interface SuperNovaLlmApiExtensionProvider<T extends SuperNovaLlmApiJson> {
  /**
   * Prepare one field for an exact serialized request.
   * @param request - immutable base request facts.
   * @returns the prepared field, or `undefined` when this request has no value for it.
   */
  prepare(
    request: SuperNovaLlmApiExtensionRequest,
  ): PreparedSuperNovaLlmApiExtension<T> | undefined | Promise<PreparedSuperNovaLlmApiExtension<T> | undefined>
}

/** All fields prepared for one request plus their joint acceptance transaction. */
export interface PreparedSuperNovaLlmApiExtensions {
  /** Detached top-level fields to merge into the base request. */
  readonly fields: Readonly<Partial<SuperNovaLlmApiExtensionMap>>
  /**
   * Commit every captured provider after HTTP 2xx. Repeated calls join the same settlement.
   * @returns fulfillment after every commit succeeds.
   */
  accept(): Promise<void>
}
