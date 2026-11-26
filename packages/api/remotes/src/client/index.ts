/** Platform-neutral assembly of generated Host Remote contributions. */

import type { Context } from '@supernova-ai/cordis'
import productAnalyticsRemote from '@supernova-ai/snh-client-product-analytics/remote'
export type {} from '@supernova-ai/snh-client-product-analytics/remote'
import agentPresetsRemote from '@supernova-ai/snh-agent-preset-registry/remote'
import userQuestionsRemote from '@supernova-ai/snh-user-questions/remote'
import commandsRemote from '@supernova-ai/snh-commands/remote'
import agentTeamsRemote from '@supernova-ai/snh-agent-team/remote'
export type {} from '@supernova-ai/snh-agent-team/remote'
import accountRemote from '@supernova-ai/snh-deepseek-account/remote'
import settingsControllerRemote from '@supernova-ai/snh-api-settings-controller/remote'
import officeKitRemote from '@supernova-ai/snh-office-kit/remote'
import goalsRemote from '@supernova-ai/snh-goal/remote'
import scheduleRemote from '@supernova-ai/snh-schedule/remote'
import llmRemote from '@supernova-ai/snh-llm/remote'
import dynamicRemote from '@supernova-ai/snh-cordis-host-runner/remote'
import pluginManagerRemote from '@supernova-ai/snh-plugin-manager/remote'
import mcpManagerRemote from '@supernova-ai/snh-mcp-manager/remote'
import toolResultsRemote from '@supernova-ai/snh-client-ui-trajectory/remote'
import pluginRegistryProbeRemote from '@supernova-ai/snh-client-ui-plugin-manager/remote'
import connectorAccountsRemote from '@supernova-ai/snh-client-ui-connector-account/remote'
import pluginMarketRemote from '@supernova-ai/snh-plugin-market/remote'
import actionCardsRemote from '@supernova-ai/snh-action-cards/remote'
import pluginRecommendationsRemote from '@supernova-ai/snh-plugin-recommendations/remote'
import pluginInventoryRemote from '@supernova-ai/snh-host-plugin-inventory/remote'
import messageFeedbackRemote from '@supernova-ai/snh-message-feedback/remote'
import permissionPresetsRemote from '@supernova-ai/snh-permission-presets/remote'
import sessionFeedbackRemote from '@supernova-ai/snh-command-feedback/remote'
import fileUploadsRemote from '@supernova-ai/snh-client-file-upload/remote'
import sessionReferencesRemote from '@supernova-ai/snh-session-reference/remote'
import subagentsRemote from '@supernova-ai/snh-subagent/remote'
import sessionStatusRemote from '@supernova-ai/snh-client-ui-session-status/remote'
export type {} from '@supernova-ai/snh-client-ui-session-status/remote'
import sessionRemote from '@supernova-ai/snh-api-session-controller/remote'
import jobRemote from '@supernova-ai/snh-api-job-controller/remote'
import workspaceRemote from '@supernova-ai/snh-api-workspace-controller/remote'
import terminalRemote from '@supernova-ai/snh-api-terminal-controller/remote'
import workspaceFilesRemote from '@supernova-ai/snh-api-workspace-files/remote'
import webRemote from '@supernova-ai/snh-web/remote'
import type { ClientRemote } from '@supernova-ai/snh-api-gateway/client'

export type { ClientRemote } from '@supernova-ai/snh-api-gateway/client'
export type {
  BundleDetail, BundleInfo, BundleRowInfo, ChangeResult, IncompatiblePlugin, InspectOptions, InstallBundleOptions, InstallSpecKind,
  ManagementError, PackageResult,
  PluginChange, PluginEntryId, PluginInfo, PluginInspectProblem, PluginInstallCancellation, PluginInstallFailureKind,
  PluginInstallLogChunk, PluginInstallProgress, PluginInstallRequestId, PluginRegistries, PluginSpecInspection,
  PluginUpdateProgress, PluginUpdateResult, PluginUpdateStep, PluginVersion, PluginVersionList, RegistryAttempt,
  ReadOnlyReason, Registry, RestartReason,
} from '@supernova-ai/snh-plugin-manager/types'
export type { McpManagedServerStatus, McpManagedServerView } from '@supernova-ai/snh-mcp-manager/types'
export type {} from '@supernova-ai/snh-plugin-manager/remote'
export type {} from '@supernova-ai/snh-mcp-manager/remote'
export type {} from '@supernova-ai/snh-client-ui-plugin-manager/remote'
export type {} from '@supernova-ai/snh-client-ui-connector-account/remote'
export type {} from '@supernova-ai/snh-client-ui-trajectory/remote'
export type {} from '@supernova-ai/snh-plugin-market/remote'
export type {} from '@supernova-ai/snh-action-cards/remote'
export type {} from '@supernova-ai/snh-plugin-recommendations/remote'
export type {
  MarketCompatibility, MarketIndexSummary, MarketInstallation, MarketInstallationStatus, MarketListingEntry, MarketListingVersion,
  MarketQuery, MarketSearchResult, MarketSort, PluginDetail, PluginDetailDocumentId, PluginDetailOrigin,
} from '@supernova-ai/snh-plugin-market/types'
export type { PluginInventorySnapshot } from '@supernova-ai/snh-host-plugin-inventory/types'
export type {} from '@supernova-ai/snh-agent-preset-registry/remote'
export type {} from '@supernova-ai/snh-user-questions/remote'
export type {} from '@supernova-ai/snh-commands/remote'
export type {} from '@supernova-ai/snh-web/remote'
export type {} from '@supernova-ai/snh-api-settings-controller/remote'
export type {} from '@supernova-ai/snh-deepseek-account/remote'
export type {} from '@supernova-ai/snh-goal/remote'
export type {} from '@supernova-ai/snh-schedule/remote'
export type {} from '@supernova-ai/snh-office-kit/remote'
export type {} from '@supernova-ai/snh-llm/remote'
export type {} from '@supernova-ai/snh-host-plugin-inventory/remote'
export type {} from '@supernova-ai/snh-message-feedback/remote'
export type {} from '@supernova-ai/snh-permission-presets/remote'
export type {} from '@supernova-ai/snh-command-feedback/remote'
export type {} from '@supernova-ai/snh-client-file-upload/remote'
export type {} from '@supernova-ai/snh-session-reference/remote'
export type {} from '@supernova-ai/snh-subagent/remote'
export type * from '@supernova-ai/snh-subagent/client'
export type {} from '@supernova-ai/snh-api-session-controller/remote'
export type * from '@supernova-ai/snh-api-session-controller/types'
export type {} from '@supernova-ai/snh-api-job-controller/remote'
export type * from '@supernova-ai/snh-api-job-controller/types'
export type {} from '@supernova-ai/snh-api-workspace-controller/remote'
export type * from '@supernova-ai/snh-api-workspace-controller/types'
export type {} from '@supernova-ai/snh-api-workspace-files/remote'
export type * from '@supernova-ai/snh-api-workspace-files/types'
export type {} from '@supernova-ai/snh-api-terminal-controller/remote'
export type * from '@supernova-ai/snh-api-terminal-controller/types'
// The forwarded-event allowlist's selection seat: without it in the consumer's
// compilation face `TypertRemoteEvent` is `never` and every `$on` call fails.
export type { ApiRemoteForwardedEvent } from '../types.ts'
// The owner packages' client-safe `./types` exports supply the `Events`
// signatures `$on` hands to a listener, so a consumer reads the very
// declaration the Host emits rather than a flattened restatement of it.
export type {} from '@supernova-ai/snh-commands/types'
export type {} from '@supernova-ai/snh-web/types'
export type {} from '@supernova-ai/snh-cordis-host-runner/types'
export type {} from '@supernova-ai/snh-credentials/types'
export type {} from '@supernova-ai/snh-llm/types'
export type {} from '@supernova-ai/snh-agent-preset-registry/types'
export type {} from '@supernova-ai/snh-permission-presets/types'
export type {} from '@supernova-ai/snh-settings/types'
export type {} from '@supernova-ai/snh-user-approval/types'
export type {} from '@supernova-ai/snh-user-questions/types'
export type {} from '@supernova-ai/snh-api-session-controller/types'

/**
 * The carrier's Client-facing types, re-exported so a business package names one
 * assembly package instead of both this facade and the Connection plugin. Type-only:
 * the carrier's runtime values stay behind their own module edge.
 */
export type {
  ConnectionHandle, ConnectionSinks, ContentBlock,
  MessageId,
  RpcId, RpcRequest, RpcResponse, RpcResult, SessionId,
  StreamChunk,
} from '@supernova-ai/snh-client-connection/client'
export type {} from '@supernova-ai/snh-api-gateway/client'
export type {} from '@supernova-ai/snh-cordis-host-runner/remote'

// The payload vocabulary of the selected namespaces, re-exported so a Client
// contribution can name what it sends and receives without importing a Host
// package: this assembly is the one place both planes legitimately meet.
export type {
  ApprovalRequestId,
  CordisHalfState,
  CordisDynamicPackageId,
  CordisDynamicPluginId,
  CordisDynamicPluginRunId,
  CordisDynamicRunMode,
  CordisInspectMethodManifest,
  CordisInspectPlatform,
  CordisInspectProviderManifest,
  CordisInspectProviderView,
  CordisInspectQueryRequest,
  CordisInspectQueryResolution,
  CordisInspectQueryResolved,
  CordisInspectRequestId,
  CordisInspectResolveAck,
  CordisRunDiagnostic,
  CordisRunStatus,
  DynamicCordisClientSource,
  DynamicCordisHostHalfResult,
  DynamicCordisInventoryRow,
  DynamicCordisInvokeResult,
  DynamicCordisPackage,
  DynamicCordisRequestResolved,
  DynamicCordisResolveAck,
  DynamicCordisRetracted,
  DynamicCordisRunRequest,
  DynamicCordisRunResolution,
  DynamicCordisRunAttempt,
  DynamicCordisRunResponse,
  DynamicCordisStopResponse,
  DynamicCordisUndefineReceipt,
  RequestRunOutcome,
} from '@supernova-ai/snh-cordis-host-runner/types'
// Credential state vocabulary for the credentials namespace (values never ride it).
export type { CredentialInfo } from '@supernova-ai/snh-credentials/types'
// Redacted namespace vocabulary for the settings namespace (secrets never ride
// it). It travels with its seam, whose `./types` the Client face already reads.
export type {
  SettingsDescribeValue, SettingsNamespaceView, SettingsPathOpView, SettingsSecretView,
} from '@supernova-ai/snh-settings/types'
// Provider registry and discovery vocabulary for the llm namespace.
export type {
  LlmConfigurableProvider, LlmDiscoveredModel,
  LlmModelDiscoveryRequest, LlmNativeAuth, LlmProviderInfo,
} from '@supernova-ai/snh-llm/types'
// Reference-discovery result vocabulary for the fileReferences and
// sessionReferenceResolver namespaces.
export type { FileReferenceCandidate } from '@supernova-ai/snh-file-reference/types'
export type { SessionReferenceMentionCandidate } from '@supernova-ai/snh-session-reference/types'

// The Remote failure vocabulary, re-exported so business packages keep naming
// this assembly alone. Types only: a value export would make spec imports load
// this module's owner /remote artifacts; specs take RemoteError from
// snh-client-test-runtime instead.
export type {
  RemoteErrorCode, RemoteErrorDetailsMap, RemoteFailure, RemoteResult,
} from '@supernova-ai/snh-typert-protocol'
export type { RemoteHostFacts } from '@supernova-ai/snh-api-gateway/client'

declare module '@supernova-ai/cordis' {
  interface Context {
    /** Generated Remote namespaces selected by this Client assembly. */
    remote: ClientRemote
  }
}

/** Required service: the typed Client Remote contribution mount. */
export const inject = ['remote']

/**
 * Mount the Host capabilities explicitly selected for this Client assembly.
 * @param ctx - Client Cordis root carrying the typed API service.
 * @returns disposer after every selected Remote namespace is ready.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposers: Array<() => Promise<void>> = []
  try {
    for (const contribution of [
      productAnalyticsRemote, agentPresetsRemote, commandsRemote, agentTeamsRemote, settingsControllerRemote, accountRemote,
      goalsRemote, llmRemote, dynamicRemote, scheduleRemote,
      pluginInventoryRemote, pluginManagerRemote, mcpManagerRemote, pluginMarketRemote, pluginRegistryProbeRemote,
      connectorAccountsRemote,
      toolResultsRemote,
      messageFeedbackRemote, sessionFeedbackRemote,
      fileUploadsRemote, sessionReferencesRemote,
      permissionPresetsRemote, subagentsRemote, sessionRemote, sessionStatusRemote, jobRemote,
      workspaceRemote, workspaceFilesRemote, terminalRemote,
      officeKitRemote, userQuestionsRemote, webRemote, actionCardsRemote, pluginRecommendationsRemote,
    ]) {
      disposers.push(await ctx.remote.$mount(contribution))
    }
  } catch (error) {
    for (const dispose of disposers.reverse()) await dispose()
    throw error
  }
  // Unwound in reverse mount order, so a namespace never outlives one mounted
  // after it.
  return async () => {
    for (const dispose of disposers.reverse()) await dispose()
  }
}
