/** Explicit exceptions and Host packages for the published dependency policy. */

/** Packages treated as Client/Host packages without declaring `snh.client`. */
const CLIENT_FACE_INCLUDE: readonly string[] = []

/** Packages exempted from automatic Client/Host treatment despite declaring `snh.client`. */
const CLIENT_FACE_EXCLUDE: readonly string[] = [
  '@supernova-ai/snh-api-session-controller',
  '@supernova-ai/snh-api-workspace-controller',
]

/** Host-only packages whose peer relays are deliberately flattened. */
const HOST_DEPENDENCY_PACKAGES: readonly string[] = [
  '@supernova-ai/snh-llm',
  '@supernova-ai/snh-session',
]

/** Required Cordis services whose Host imports are type-only. */
const REQUIRED_SERVICE_PEERS = {
  '@supernova-ai/snh-api-terminal-controller': ['@supernova-ai/snh-subprocess'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Development-only package relationships not represented by source imports. */
const CONFIGURATION_ONLY_DEV_DEPENDENCIES = {
  '@supernova-ai/snh-client-locale': ['@supernova-ai/snh-api-remotes'],
  '@supernova-ai/snh-client-ui-conversation': [
    '@supernova-ai/snh-api-remotes',
    '@supernova-ai/snh-client-ui-workspace',
  ],
  '@supernova-ai/snh-client-ui-model-selection': ['@supernova-ai/snh-client-ui-input-trigger'],
  '@supernova-ai/snh-client-ui-sidebar': ['@supernova-ai/snh-client-ui-workspace'],
  '@supernova-ai/snh-client-ui-subagent': ['@supernova-ai/snh-client-ui-input-trigger'],
  '@supernova-ai/snh-client-ui-theme': ['@supernova-ai/snh-api-remotes'],
  '@supernova-ai/snh-client-ui-tool': ['@supernova-ai/snh-api-remotes'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Workspace packages whose complete runtime surface is safe across duplicate installations. */
const DUPLICATE_SAFE_PACKAGES: readonly string[] = [
  '@supernova-ai/snh-brand',
  '@supernova-ai/snh-lazy-require',
  '@supernova-ai/snh-typert-protocol',
  '@supernova-ai/snh-util-code-language',
  '@supernova-ai/snh-util-crypto',
  '@supernova-ai/snh-util-text-search',
  '@supernova-ai/snh-util-values',
]

/**
 * Runtime exports whose values remain valid when npm installs another package copy.
 * New entries are forbidden by default. Automated agents must not add an
 * exception; every addition requires explicit human review and a dedicated,
 * prominent heading in the pull request description.
 */
const SAFE_HOST_DEPENDENCY_EXPORTS = {
  '@supernova-ai/snh-atomic-write': ['withFileLock', 'writeFileAtomic'],
  '@supernova-ai/snh-deque': ['Deque'],
  // Builds a dispatcher from the resolved proxy policy; the caller owns and closes it.
  '@supernova-ai/snh-http-proxy': ['createRouteDispatcher'],
  // The Liveshare wire codec and identity helpers are stateless functions over caller-owned values.
  '@supernova-ai/snh-experimental-liveshare-protocol': [
    'LIVESHARE_CAPABILITIES', 'LIVESHARE_PROTOCOL_VERSION', 'parseRelayFrame', 'parseShareAccessState',
    'parseTunnelWorkerCommand', 'parseTunnelWorkerEvent', 'rawText', 'sendFrame', 'unsupportedFrameRefusal',
    'viewerRequestFields', 'identityFromKey', 'identityKeyOf',
  ],
  // The shipped profile templates are plain data; a consumer reads their bundle names only.
  '@supernova-ai/snh-official-bundles': ['PROFILE_TEMPLATES'],
  // Messages and assembled blocks are plain data. Each caller owns its assembler.
  '@supernova-ai/snh-llm': ['BlockAssembler', 'callConfigEquals', 'createUserMessage'],
  '@supernova-ai/snh-session-format': ['sessionFormatLogFilename'],
  '@supernova-ai/snh-storage-domain': ['defineDomain'],
  '@supernova-ai/snh-timeout': ['MAX_TIMER_DELAY_MS'],
  // Both operate only on the caller's subprocess service and handle; the module memoizes only the binary path.
  '@supernova-ai/snh-util-ripgrep': ['readRipgrepLines', 'spawnRipgrep'],
  '@supernova-ai/schemastery': ['default'],
} as const satisfies HostDependencyExports

/** Runtime exports that require every consumer to resolve the provider's shared peer instance. */
const PEER_REQUIRED_HOST_EXPORTS = {
  // Agent notifications must use the installed Agent and scope dispatch implementation.
  '@supernova-ai/snh-agent': ['emitAgentEvent'],
  // Profile settings must match the installed Node provider's configuration schema.
  '@supernova-ai/snh-ptc-runtime-node/configuration': ['resolvePersistentExecution'],
  // CUA mounts the installed provider and shares executor error classes with PTC.
  '@supernova-ai/snh-ptc-runtime-node': ['default'],
  '@supernova-ai/snh-tool-executor-ptc/run-code': ['RunCodeConfig', 'createRunCodeTool'],
  // CUA checks UserQuestionError and preserves AttachmentError from image admission; longEdgeDimensions is pure
  // arithmetic that rides the same peer.
  '@supernova-ai/snh-attachment': ['admitEncodedImages', 'longEdgeDimensions'],
  '@supernova-ai/snh-user-questions': ['UserQuestionError'],
  // The tool registry and every subclass rely on `instanceof` against one HarnessError class.
  '@supernova-ai/snh-error': ['HarnessError'],
  // The Remote plugin uses the injected credential service; its key helper follows that peer.
  '@supernova-ai/snh-credentials': ['credentialKey'],
  // `instanceof` checks need the translator's own class instance.
  '@supernova-ai/snh-experimental-translator': ['TranslationError'],
  // Stateless; a safe classification would turn the forge panel's forge and worktree peers into dependencies.
  '@supernova-ai/snh-experimental-forge': ['changeRequestKey'],
  '@supernova-ai/snh-experimental-worktree': ['generatedWorktreeName', 'CREATED_RECORD', 'createdWorktreeSchema'],
  // Stateless; the injected WebServer remains a peer.
  '@supernova-ai/snh-host-webserver': ['normalizeBindAddress'],
  // The forge panel matches ctx.fs failures with `instanceof FsError`.
  '@supernova-ai/snh-fs': ['FsError'],
  '@supernova-ai/snh-scope': ['carrierKeyOf', 'createScope', 'scopeOf', 'scopeParentOf', 'scopeTarget'],
  // appendPluginRecord writes through the Session class's private log; pluginRecordOf is stateless.
  // The SuperNova chat importer validates its seed with the installed Session log validation before storing it.
  '@supernova-ai/snh-session': ['SESSION_FORMAT_VERSION', 'appendPluginRecord', 'pluginRecordOf', 'validateSessionLog'],
  '@supernova-ai/snh-session-persistence': ['SessionPersistenceNotFoundError'],
  // Imported titles follow the installed title service's normalization.
  '@supernova-ai/snh-session-title': ['normalizeSessionTitle'],
  // Error classes have instance identity; CUA and Liveshare throw the registry's own copy so `instanceof` against it matches.
  '@supernova-ai/snh-tools': ['defineTool', 'ToolArgsError', 'ToolContextUnavailableError', 'RUN_CODE_NAME'],
  // Readers recognize a deadline's TimeoutReason only by `instanceof` against their own copy.
  '@supernova-ai/snh-timeout': ['deadline', 'timeoutOf'],
  // Imported web tool results must render exactly like the installed web tools' results and cards.
  '@supernova-ai/snh-tool-web': ['fetchMetaFromValue', 'formatFetchOutput', 'formatSearchOutput', 'searchMetaFromValue'],
} as const satisfies HostDependencyExports

/** Exact import specifier to reviewed runtime exports. */
type HostDependencyExports = Readonly<Record<string, readonly string[]>>

/** Complete configurable input to package dependency classification. */
export interface PackageDependencyPolicy {
  readonly clientFaceInclude: readonly string[]
  readonly clientFaceExclude: readonly string[]
  readonly hostPackages: readonly string[]
  readonly requiredServicePeers?: Readonly<Record<string, readonly string[]>>
  readonly configurationOnlyDevDependencies: Readonly<Record<string, readonly string[]>>
  readonly duplicateSafePackages?: readonly string[]
  readonly safeHostDependencyExports: HostDependencyExports
  readonly peerRequiredHostExports: HostDependencyExports
}

/** Repository dependency policy consumed by verification and benchmarking. */
export const PACKAGE_DEPENDENCY_POLICY: PackageDependencyPolicy = {
  clientFaceInclude: CLIENT_FACE_INCLUDE,
  clientFaceExclude: CLIENT_FACE_EXCLUDE,
  hostPackages: HOST_DEPENDENCY_PACKAGES,
  requiredServicePeers: REQUIRED_SERVICE_PEERS,
  configurationOnlyDevDependencies: CONFIGURATION_ONLY_DEV_DEPENDENCIES,
  duplicateSafePackages: DUPLICATE_SAFE_PACKAGES,
  safeHostDependencyExports: SAFE_HOST_DEPENDENCY_EXPORTS,
  peerRequiredHostExports: PEER_REQUIRED_HOST_EXPORTS,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Whether a package manifest declares a dynamically loaded Client entry. */
export function hasClientDeclaration(snhField: unknown): boolean {
  return isRecord(snhField) && Object.hasOwn(snhField, 'client')
}
