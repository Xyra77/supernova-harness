/**
 * Value exports that plugin entries already had when verify-plugin-entry-exports started enforcing the plugin entry
 * rule in docs/defensive-patterns/package-surface.md. Each line records existing debt, not an approved exception. The
 * gate passes a listed export and fails a line when its package has no plugin entry, when its export list is empty or
 * repeats a name, or when it names an export the entry no longer reports, so removing an export removes its line in
 * the same change. A line added after the gate's introduction is an exception under the rule, and the rule requires
 * the domain owner's confirmation for it.
 */
export const EXISTING_PLUGIN_ENTRY_EXPORTS = {
  '@supernova-ai/snh-acp-app': ['ACP_APP_STARTUP_SERVICE'],
  '@supernova-ai/snh-action-cards': ['isPluginStopping'],
  '@supernova-ai/snh-agent': [
    'AgentModel', 'agentCarrier', 'agentEvents', 'assembleContextFor', 'emitAgentEvent', 'foldConsumedWork',
    'installModelSelection', 'modelSelectionProjectionDefinition',
  ],
  '@supernova-ai/snh-agent-instructions': [
    'discoverBaselineInstructionFiles', 'loadBaselineInstructions', 'renderAgentInstructions',
  ],
  '@supernova-ai/snh-agent-loop': ['CONFIGURED_AGENT_IDENTITIES_KEY', 'DEFAULT_MAX_PARALLEL_TOOL_CALLS'],
  '@supernova-ai/snh-agent-preset-registry': [
    'agentPresetProjectionDefinition', 'auditRows', 'entryListProblem', 'leakedServices',
  ],
  '@supernova-ai/snh-agent-team': ['TeamId', 'TeamMessageId', 'TeamTaskId'],
  '@supernova-ai/snh-api-remote-access': ['REMOTE_ACCESS_SNAPSHOT_KEY'],
  '@supernova-ai/snh-api-remotes': ['API_REMOTE_FORWARDED_EVENTS'],
  '@supernova-ai/snh-attachment-local': [
    'DEFAULT_IMAGE_COMPRESSION_CONCURRENCY', 'DEFAULT_MAX_IMAGES_PER_MESSAGE', 'DEFAULT_MAX_IMAGE_BYTES',
    'DEFAULT_MAX_IMAGE_DIMENSION', 'DEFAULT_MAX_IMAGE_PIXELS', 'DEFAULT_MAX_MESSAGE_IMAGE_BYTES',
    'DEFAULT_NORMALIZED_IMAGE_MAX_BYTES', 'DEFAULT_NORMALIZED_IMAGE_MAX_DIMENSION',
    'DEFAULT_NORMALIZED_IMAGE_MAX_PIXELS', 'MAX_IMAGE_COMPRESSION_CONCURRENCY', 'canPassThroughNormalization',
    'commitPreparedImageFile', 'normalizeImage', 'prepareImageFile', 'readImageFile', 'readRequestImageFile',
    'requestImageVariantId', 'saveImageFile', 'validateImageFile',
  ],
  '@supernova-ai/snh-bash-local': ['ENV_OVERRIDES', 'assertServiceableBashConfig'],
  '@supernova-ai/snh-client-connection': [
    'API_PATH', 'CONNECT_PATH', 'Peer', 'RpcId', 'clientRequestSchema', 'rpcErrorSchema', 'rpcIdSchema',
    'rpcMessageSchema', 'rpcResultSchema', 'serverResponseSchema', 'transportError',
  ],
  '@supernova-ai/snh-client-locale': ['LOCALE_IDS', 'LOCALE_PREFERENCE_FIELD', 'LOCALE_SETTINGS_NAMESPACE'],
  '@supernova-ai/snh-client-modules': ['bootInjections', 'orderByModuleGraph', 'stripClientSuffix'],
  '@supernova-ai/snh-client-ui-chat': [
    'CHAT_SETTINGS_NAMESPACE', 'DEFAULT_TRANSCRIPT_VIEW_MODE', 'LEGACY_EXPANDED_TRANSCRIPT_VIEW_MODE',
    'LEGACY_TRANSCRIPT_VIEW_MODE', 'TRANSCRIPT_VIEW_FIELD', 'TRANSCRIPT_VIEW_MODES',
  ],
  '@supernova-ai/snh-client-ui-conversation': [
    'BUSY_ENTER_BEHAVIORS', 'BUSY_ENTER_FIELD', 'CONVERSATION_SETTINGS_NAMESPACE', 'DEFAULT_BUSY_ENTER_BEHAVIOR',
  ],
  '@supernova-ai/snh-client-ui-theme': [
    'DEFAULT_FONT_SIZE', 'DEFAULT_PREFERENCE', 'FONT_SIZE_FIELD', 'FONT_SIZE_MAX', 'FONT_SIZE_MIN', 'THEME_PREFERENCES',
    'THEME_PREFERENCE_FIELD', 'THEME_SETTINGS_NAMESPACE',
  ],
  '@supernova-ai/snh-command-feedback': ['FEEDBACK_CATEGORIES', 'recordFeedback'],
  '@supernova-ai/snh-commands': ['CommandDefinitionId', 'CommandId', 'name', 'parseCommand'],
  '@supernova-ai/snh-compaction-tool-result-pruner': ['DEFAULTS', 'PRUNE_MARKER', 'codePointLength', 'resolveConfig'],
  '@supernova-ai/snh-cordis-host-runner': [
    'ApprovalRequestId', 'CordisDynamicPackageId', 'CordisDynamicPluginId', 'CordisDynamicPluginRunId',
  ],
  '@supernova-ai/snh-credentials-local': [
    'CREDENTIALS_FILENAME', 'DOCUMENT_VERSION', 'parseCredentialsDocument', 'renderFlatLayoutMigration', 'resolveSpec',
  ],
  '@supernova-ai/snh-cua': ['CuaConfig', 'installCua'],
  '@supernova-ai/snh-cua-macos': ['GUIDANCE'],
  '@supernova-ai/snh-experimental-claude-code-mods': [
    'DEFAULT_TOOL_ALIASES', 'KNOWN_EVENTS', 'MODS_API_VERSION', 'SERVED_EVENTS', 'defineMod',
  ],
  '@supernova-ai/snh-experimental-forge': ['changeRequestKey'],
  '@supernova-ai/snh-experimental-inspector': ['resolveInspectorOptions', 'startInspector'],
  '@supernova-ai/snh-experimental-worktree': [
    'CREATED_RECORD', 'createdWorktreeSchema', 'generatedWorktreeName', 'worktreeProjection',
  ],
  '@supernova-ai/snh-goal': [
    'GOAL_CHANGE_VERSION', 'GoalId', 'applyGoalProjection', 'decodeGoalChange', 'foldGoal', 'goalChangeRef',
    'goalProjectionDefinition',
  ],
  '@supernova-ai/snh-goal-round-driver': ['renderGoalRoundPrompt'],
  '@supernova-ai/snh-host-directory-picker-auto': [
    'BACKEND_PACKAGES', 'SURFACE_PACKAGES', 'canExecute', 'hasLinuxChooserBinary', 'resolveDirectoryPickerBackend',
  ],
  '@supernova-ai/snh-host-directory-picker-browse': ['boundedInsert', 'fullyQualified', 'raceAbort'],
  '@supernova-ai/snh-host-directory-picker-native': ['pickNativeDirectory'],
  '@supernova-ai/snh-host-plugin-inventory': ['pluginEntryId', 'readPluginInventory'],
  '@supernova-ai/snh-host-product-telemetry-otel': ['Config'],
  '@supernova-ai/snh-host-webserver': [
    'bindUrlHost', 'isLoopbackHost', 'isWildcardHost', 'normalizeBindAddress', 'renderIndexInjections',
  ],
  '@supernova-ai/snh-jobs-local': ['TASK_WAIT_TIMEOUT'],
  '@supernova-ai/snh-llm': [
    'ACCOUNT_QUOTA_EXCEEDED_CODE', 'APP_IDENTITY', 'AssistantStreamAccumulator', 'BlockAssembler',
    'CONTEXT_SUMMARY_MAX_CHARS', 'CONTEXT_WINDOW_EXCEEDED_CODE', 'EMPTY_RESPONSE_CODE', 'IMAGE_OFFLOAD_REQUIRED_CODE',
    'INVALID_CREDENTIAL_CODE', 'LLM_FAILURE_CODES', 'LlmAdapter', 'LlmAttemptId', 'MessageId', 'ProviderRequestId',
    'QUOTA_EXCEEDED_CODE', 'RETRY_CODE_CHOICES', 'ReasoningEffortId', 'RetryPolicySchema', 'ToolCallId',
    'assembleAssistantStream', 'assistantStreamChunks', 'assistantStreamFirstTokenTime',
    'assistantStreamHasVisibleContent', 'assistantStreamHasVisibleText', 'attributionHeaders', 'boundContextSummary',
    'callConfigEquals', 'chunkHasVisibleText', 'contentHasFile', 'contentHasImage', 'createAssistantMessage',
    'createDeveloperMessage', 'createMessage', 'createSystemMessage', 'createToolResultMessage', 'createUserMessage',
    'errorChain', 'expandAssistantStream', 'fileHandleText', 'freezeMessage', 'isAgentLoopRequest',
    'isContextWindowExceededError', 'isHarnessError', 'isQuotaExceededError', 'isTokenDelta', 'isVisibleChunk',
    'joinAssistantStreamText', 'lastAssistantStreamChunk', 'markAgentLoopRequest',
    'offloadedImageText', 'projectFilesToText', 'projectImagesForTextModel', 'projectOffloadedImages',
    'projectToolUpdates', 'requestImageHandleText', 'requiredImageOffload', 'resolveImageAttachmentAccess',
    'resolveRetryPolicy', 'runFirstTokenTime', 'runFirstVisibleTime', 'textOnlyImageText', 'userAgent',
  ],
  '@supernova-ai/snh-llm-pi-ai': ['PiAiAdapter', 'supportedProtocols'],
  '@supernova-ai/snh-llm-replay': [
    'deriveReplayScript', 'installLlmReplay', 'loadReplayScript', 'loadSessionScripts', 'parseSessionHeader',
    'parseSessionLog', 'prepareSessionSnapshotFixtureForComparison', 'resolveScriptedEntry',
  ],
  '@supernova-ai/snh-llm-retry': ['RetryId'],
  '@supernova-ai/snh-lsp': ['LspProviderId', 'finalExtension'],
  '@supernova-ai/snh-mcp-client': ['createMcpToolDefinition'],
  '@supernova-ai/snh-office-kit': ['Config', 'OfficeKitGeneration', 'OfficeKitKey', 'OfficeSourceKey'],
  '@supernova-ai/snh-permission-presets': ['AUTO_PRESET', 'CUSTOM_PRESET'],
  '@supernova-ai/snh-persona': ['PERSONA_PREFIX_SECTION', 'PERSONA_SUFFIX_SECTION'],
  '@supernova-ai/snh-plan-mode': ['EXIT_PLAN_MODE', 'planProjectionDefinition', 'resolveConfig'],
  '@supernova-ai/snh-plugin-manager': ['classifyInstallFailure', 'parseInstallSpec', 'pinnedGitOrigin'],
  '@supernova-ai/snh-pwsh-local': [
    'ENCODING_PREAMBLE', 'ENV_OVERRIDES', 'assertServiceablePwshConfig', 'candidatePwshPaths', 'resolvePwshPath',
  ],
  '@supernova-ai/snh-sandbox-policy': ['SANDBOX_MODES', 'setSandboxMode'],
  '@supernova-ai/snh-schedule': [
    'DEFAULT_LIST_LIMIT', 'MAX_LIST_LIMIT', 'MAX_TITLE_LENGTH', 'MIN_EVERY_INTERVAL_SECONDS', 'REQUIRED_TITLE_MESSAGE',
    'ScheduleId', 'canonicalizeCronExpression', 'createAfterScheduleRecord', 'createAtScheduleRecord',
    'createCronScheduleRecord', 'createDailyScheduleRecord', 'createEveryScheduleRecord', 'createWeeklyScheduleRecord',
    'decodeScheduleRecord', 'formatScheduleLocalTime', 'isRecurringScheduleRecord', 'normalizeWeekdays',
    'parseCronInput', 'parseWeeklyInput', 'renderRecurringReminderBatchFraming', 'renderReminderFraming',
    'resolveCronOccurrence', 'resolveDailyOccurrence', 'resolveEveryOccurrence', 'resolveRecurringOccurrence',
    'resolveWeeklyOccurrence', 'scheduleDomain', 'scheduleTitle', 'weeklyTime',
  ],
  '@supernova-ai/snh-sdk-app': ['SDK_APP_STARTUP_SERVICE'],
  '@supernova-ai/snh-sdk-jsonrpc-server': ['HarnessSdkJsonRpcServer'],
  '@supernova-ai/snh-session': [
    'KNOWN_SESSION_EVENT_TYPES', 'SESSION_FORMAT_VERSION', 'Session', 'SessionId', 'SessionLogOffset',
    'SessionPreparation', 'SessionSeq', 'TOOL_NOT_STARTED', 'TOOL_OUTCOME_UNKNOWN', 'ToolCallRecovery',
    'adoptSessionEvent', 'appendPluginRecord', 'buildForkSeed', 'canonicalHeader', 'decodeSeqRanges',
    'deriveEventMessage', 'encodeSeqRanges', 'foldRequestHeader', 'foldSurface', 'headerEquals',
    'interruptedTurnClosers', 'isAppendSurfaceEvent', 'isReplacementSurfaceEvent', 'isSurfaceEligibleType',
    'isSurfaceEvent', 'pluginRecordOf', 'snapshotSessionEvent',
    // SessionData v2 transition: temporary exemption until these values move to a subpath export.
    'buildSessionHeader', 'needsInheritedSeedMarker', 'validateSessionLog',
  ],
  '@supernova-ai/snh-session-log-supernova': ['acceptedThrough'],
  '@supernova-ai/snh-session-log-export': [
    'DEFAULT_SESSION_LOG_COMPRESSION_LEVEL', 'SESSION_LOG_EXPORT_PATH', 'SESSION_LOG_FILENAME', 'flushLiveSessionLog',
    'formatSessionMarkdown', 'readSessionLogText', 'serializeSessionLog', 'sessionLogExportDeps',
    'sessionLogZipEntries', 'sessionLogZipFilename', 'streamSessionLogZip',
  ],
  '@supernova-ai/snh-session-persistence-jsonl': ['JsonlCompressionSchema'],
  '@supernova-ai/snh-session-projection-cache': [
    'Config', 'checkpointIdentity', 'checkpointRecord', 'checkpointRow', 'projectionCacheDomainSpec',
  ],
  '@supernova-ai/snh-session-query-sqlite': [
    'SESSION_QUERY_SQLITE_APPLICATION_ID', 'SESSION_QUERY_SQLITE_DEFAULT_LIMIT', 'SESSION_QUERY_SQLITE_MAX_LIMIT',
    'SESSION_QUERY_SQLITE_PATH_KEY', 'SESSION_QUERY_SQLITE_SCHEMA_VERSION', 'SESSION_QUERY_SQLITE_SNIPPET_CHARS',
  ],
  '@supernova-ai/snh-session-reference': [
    'DEFAULT_CANDIDATE_LIMIT', 'DEFAULT_MAX_REFERENCE_BYTES', 'MAX_REFERENCES', 'SESSION_REFERENCE_SCHEME',
    'decodeSessionReferenceUri', 'encodeSessionReferenceUri', 'formatSessionReferenceMention',
    'parseSessionReferenceText',
  ],
  '@supernova-ai/snh-session-telemetry-otel': [
    'Config', 'DEFAULT_SHUTDOWN_TIMEOUT_MILLIS', 'DEFAULT_TELEMETRY_MODE', 'SessionTelemetryMode',
  ],
  '@supernova-ai/snh-session-title': [
    'SessionTitleProviderId', 'fallbackSessionTitle', 'foldSessionTitle', 'normalizeSessionTitle',
    'titleProjectionDefinition', 'truncateTitleUtf8',
  ],
  '@supernova-ai/snh-settings': ['redactSecrets'],
  '@supernova-ai/snh-skill': [
    'BUNDLED_SKILL_RANK', 'escapeText', 'isModelInvocable', 'isSkillName', 'isUserInvocable', 'renderSkillContent',
  ],
  '@supernova-ai/snh-skill-filesystem': ['FileSystemSkillProvider'],
  '@supernova-ai/snh-spill-local': [
    'DEFAULT_ROOT_PREFIX', 'discoverDefaultRoots', 'encodeSegment', 'isErrno', 'privateRoot', 'saveTextFile',
    'sessionDir', 'sweepSpillRoots',
  ],
  '@supernova-ai/snh-storage': ['BackendRegistry', 'UNIT_NAME_RE', 'storageBackendServiceKey'],
  '@supernova-ai/snh-storage-domain': ['DomainFacility', 'defineDomain', 'descriptorOf', 'domainTable'],
  '@supernova-ai/snh-storage-json': ['JsonStorageBackend'],
  '@supernova-ai/snh-storage-sqlite': ['STORAGE_SQLITE_SCHEMA_VERSION', 'SqliteStorageBackend'],
  '@supernova-ai/snh-subagent': [
    'AssistantOutputFold', 'NO_START_CAPABILITIES', 'ROOT_AGENT_NAME', 'STRUCTURED_OUTPUT_TOOL',
    'SUBAGENT_DESCRIPTOR_VERSION', 'SubagentRunId', 'appendDelegatedPolicyOverrides', 'applyChildComposition',
    'assertPositiveFinite', 'assertSubagentMaxDepth', 'assertUsableCwd', 'captureDelegatedPolicyOverrides',
    'childSessionMeta', 'delegationDepthOf', 'finalAssistantOutput', 'foldSubagentDescriptor',
    'parentAgentOptionsForDelegation', 'resolveChildAgentOptions', 'resolveChildDepth', 'settleRunResult',
    'snapshotSubagentDescriptor', 'subprocessRunHandle',
  ],
  '@supernova-ai/snh-system-prompt': [
    'PERSONA_PREFIX_SECTION', 'PERSONA_SUFFIX_SECTION', 'TOOL_ORDER_REST', 'joinContextSections',
    'renderContextSections', 'renderContextSnapshot', 'renderPrompt',
  ],
  '@supernova-ai/snh-terminal': ['TerminalSessionId'],
  '@supernova-ai/snh-terminal-bash': ['BashTerminalBackend', 'PWSH_PROMPT_SETUP'],
  '@supernova-ai/snh-terminal-panel': ['GUIDANCE'],
  '@supernova-ai/snh-tool-call-timeout-policy': ['TOOL_TIMEOUT'],
  '@supernova-ai/snh-tool-executor-native': ['NativeToolExecutor'],
  '@supernova-ai/snh-tool-executor-ptc': ['PtcExecutor', 'jsonSchemaToTs', 'renderToolsSdk'],
  '@supernova-ai/snh-tool-fs-search': [
    'GLOB_MAX_RESULTS', 'GLOB_VCS_EXCLUDES', 'GREP_MAX_LINE_BYTES', 'GREP_MAX_MATCHES', 'RAW_OUTPUT_MAX_BYTES',
    'SEARCH_GRACE_MS', 'SEARCH_META_MAX_BYTES', 'SEARCH_STDERR_MAX_BYTES', 'SEARCH_TIMEOUT_MS', 'applyGlobTool',
    'applyGrepTool', 'buildGlobCommand', 'buildGrepCommand', 'formatGlobOutput', 'formatGrepMatches',
    'formatGrepOutput', 'parseGlobArgs', 'parseGrepArgs', 'parseGrepMatches', 'presentGlobCall', 'presentGlobResult',
    'presentGrepCall', 'presentGrepResult', 'previewLine', 'resolveRgPath', 'runRipgrep', 'sampleAcrossTopLevel',
    'toWorkdirRelative', 'trySaveFormattedResult',
  ],
  '@supernova-ai/snh-tool-lsp': [
    'DEFAULT_LSP_TOOL_TIMEOUT_MS', 'DEFAULT_MAX_LOCATIONS', 'DEFAULT_MAX_RESULT_CHARS', 'LSP_OPERATIONS',
    'LSP_PROMPT_TEXT', 'formatHover', 'formatLocations', 'parseLspArgs', 'presentLspCall', 'renderUri',
  ],
  '@supernova-ai/snh-tool-session-query': ['DEFAULT_MAX_SEARCH_RESULTS', 'DEFAULT_SEARCH_TIMEOUT_MS'],
  '@supernova-ai/snh-tool-terminal': ['DEFAULT_MAX_RESULT_BYTES', 'MIN_MAX_RESULT_BYTES'],
  '@supernova-ai/snh-tool-web': [
    'DEFAULT_FETCH_MAX_OUTPUT_CHARS', 'DEFAULT_WEB_TOOL_TIMEOUT_MS', 'WEB_SEARCH_MAX_QUERIES', 'WEB_SEARCH_MAX_RESULTS',
    'applyWebFetchTool', 'applyWebSearchTool', 'fetchMetaFromResult', 'fetchMetaFromValue', 'formatFetchOutput',
    'formatSearchOutput', 'parseFetchArgs', 'presentFetchCall', 'presentFetchResult', 'presentSearchCall',
    'presentSearchResult', 'searchMetaFromResult', 'searchMetaFromValue',
  ],
  '@supernova-ai/snh-tool-workspace-dependencies': [
    'copyPrimaryRuntime', 'installPrimaryRuntime', 'parsePrimaryRuntime', 'primaryRuntimePythonAliases',
    'readPrimaryRuntime', 'resolvePrimaryRuntime', 'workspaceDependencyPaths',
  ],
  '@supernova-ai/snh-tools': [
    'RUN_CODE_NAME', 'TOOL_ABORTED', 'TOOL_ABORTED_BEFORE_DISPATCH', 'assertObjectJsonSchema',
    'assertSupportedJsonSchema', 'defineTool', 'isJsonSchemaRecord', 'isPlainJsonArray', 'isPlainJsonRecord',
    'parameterSchemaSpecToJsonSchema', 'projectToolSchema', 'validateArgs', 'validateJsonSchemaValue',
    'valueSchemaSpecToJsonSchema',
  ],
  '@supernova-ai/snh-typert-loader': ['TYPERT_HOST_EXPORT', 'validateTypertManifest'],
  '@supernova-ai/snh-typert-registry': ['typertEndpoint', 'typertKey', 'typertPackageKey'],
  '@supernova-ai/snh-user-approval': ['APPROVAL_POLICIES', 'ApprovalRequestId', 'setApprovalPolicy'],
  '@supernova-ai/snh-user-questions': ['TIMED_WAIT_PARAMETER', 'isTimedAskUserQuestionSchema'],
  '@supernova-ai/snh-web-app': ['internals'],
  '@supernova-ai/snh-web-supernova-api': [
    'DEEPSEEK_DEFAULT_COUNT', 'DEEPSEEK_FETCH_API_PROVIDER_ID', 'DEEPSEEK_SEARCH_API_PROVIDER_ID',
    'DEEPSEEK_SEARCH_REQUESTS_PER_SECOND', 'DEEPSEEK_WEB_API_BASE_URL', 'SuperNovaFetchApiProvider',
    'SuperNovaSearchApiProvider', 'mapSearchResponse',
  ],
  '@supernova-ai/snh-web-fetch-http': ['DEFAULT_USER_AGENT', 'HttpFetchProvider', 'LOCAL_FETCH_PROVIDER_ID'],
  '@supernova-ai/snh-web-search-supernova': [
    'DEEPSEEK_DEFAULT_API_VERSION', 'DEEPSEEK_DEFAULT_BASE_URL', 'DEEPSEEK_DEFAULT_MAX_TOKENS',
    'DEEPSEEK_DEFAULT_MAX_USES', 'DEEPSEEK_DEFAULT_MODEL', 'DEEPSEEK_PROVIDER_ID', 'SuperNovaSearchProvider',
    'WEB_SEARCH_DEEPSEEK_SETTINGS_NAMESPACE',
  ],
  '@supernova-ai/snh-webhook': ['WebhookDeliveryId', 'WebhookRuleId', 'WebhookSourceId'],
  '@supernova-ai/snh-workflow-ptc': ['materializeFromRealm', 'validateMeta'],
  '@supernova-ai/snh-workspace': [
    'WorkspaceId', 'realpathNormalize', 'workspaceDomainSpec', 'workspaceDomainState', 'workspaceRecord',
  ],
} as const satisfies Readonly<Record<string, readonly string[]>>
