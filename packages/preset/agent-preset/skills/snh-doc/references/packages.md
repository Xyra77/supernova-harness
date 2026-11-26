# Loadable Harness plugin packages

This file is GENERATED from workspace manifests (`scripts/gen-plugin-packages.ts`) and verified fresh by `pnpm run verify-plugin-packages` (part of `doc-sync`); do not edit it by hand.

Every package below exports a Cordis plugin that a bundle patch can name in a Loader row. `Config` marks packages whose row accepts a `config` mapping; read the mounted schema from `Config.listConfigs` through `cordis_inspect` (filter by `name`, then query the `entry` id) when available, otherwise from the package README. Packages under `experimental` are pre-stable.

## account

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-deepseek-account` | yes | Sign in to SuperNova and manage account credentials and notifications |
| `@supernova-ai/snh-supernova-auth` | no | SuperNova request authentication (ctx.supernovaAuth): choose between the API key and the account sign-in for one SuperNova API request and release its headers |

## acp

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-acp` | yes | Automation-only Agent Client Protocol server for driving SuperNova Harness agents over JSON-RPC stdio |

## api

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-api-gateway` | yes | Typert Remote Host dispatcher and Client API endpoint |
| `@supernova-ai/snh-api-job-controller` | yes | Job Remote observation stream and the reference-counted client job-output service |
| `@supernova-ai/snh-api-remote-access` | no | Method-level Remote access control for non-owner Peers and the per-Peer access snapshot |
| `@supernova-ai/snh-api-remotes` | no | Remote BFF assembly for application-selected Host capabilities |
| `@supernova-ai/snh-api-session-controller` | yes | Session Remote commands, cold reads, and live control transport |
| `@supernova-ai/snh-api-settings-controller` | yes | Remote owner for the configuration surfaces over the settings-domain seams |
| `@supernova-ai/snh-api-terminal-controller` | yes | Session-owned interactive terminals with shell discovery, screen recovery and typed Remote control |
| `@supernova-ai/snh-api-workspace-controller` | yes | Workspace Remote commands and reconnect-safe state transport |
| `@supernova-ai/snh-api-workspace-files` | yes | Workspace file service and Client resource provider: bounded reads, directory listing, and live metadata over the workspaceFiles Remote namespace |

## attachment

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-attachment-local` | yes | Private content-addressed SNH_HOME attachment storage |

## boot

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-config-editor` | no | Persist plugin configuration through profile patches and Loader reconciliation |
| `@supernova-ai/snh-hmr` | yes | Coordinated module and profile configuration hot reload |
| `@supernova-ai/snh-plugin-manager` | yes | Current-profile plugin and bundle management shared by snh CLI, Web and agent tools |
| `@supernova-ai/snh-plugin-market` | yes | Configured plugin market indexes for the Web Discover page and the plugin_market agent tool |

## browser-use

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-browser-use` | no | Exclusive named browser-use provider registration |

## bundle

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-acp-app` | no | The snh ACP profile bundle: automation-only JSON-RPC stdio and process lifecycle over snh-base |
| `@supernova-ai/snh-headless` | yes | The snh one-shot bundle: a direct core Agent/Session runner over snh-base with no Host, HTTP, or browser layer |
| `@supernova-ai/snh-sdk-app` | yes | The snh SDK profile bundle: stdio JSON-RPC serving and process lifecycle over snh-base |
| `@supernova-ai/snh-web-app` | yes | The snh browser-surface bundle: the web patch layer over snh-base plus the runtime glue plugin (frontend dist serving, bash runtime variables, URL line) |

## client

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-client-config` | no | Types of browser-synced plugin configuration |
| `@supernova-ai/snh-client-connection` | yes | Authenticated RPC transport and generation lifecycle |
| `@supernova-ai/snh-client-file-upload` | no | Agent-scoped browser file upload, streaming intake, and staged receipt service |
| `@supernova-ai/snh-client-hmr` | yes | Web client graph and rebuilt-bundle delivery over an authenticated Remote stream |
| `@supernova-ai/snh-client-locale` | no | Locale plugin: Host-backed preference, extensible language catalog, browser fallback, and typed built-in dictionaries |
| `@supernova-ai/snh-client-modules` | no | Client module system, dual-face: node half composes the __SNH_BOOT__ entry graph (incremental snh.client scan, bundle route, index tap, webPlugins service); browser half is the lazy-CJS module table the vendored cordis Loader consumes as its internal seam |
| `@supernova-ai/snh-client-product-analytics` | yes | Desktop product event collection and authenticated Host reporting |
| `@supernova-ai/snh-client-remote-connection` | yes | QR login, private login links, and owner-approved browser pairing |
| `@supernova-ai/snh-client-resources` | no | Unified client resource model: protocol-registered providers turn URL addresses into live values, consumed through the useResource global standard hook |
| `@supernova-ai/snh-client-script-realm` | no | Direct-reference script environments and Cordis-owned provider registration |
| `@supernova-ai/snh-client-script-realm-iframe` | no | Optional iframe ScriptRealm provider |
| `@supernova-ai/snh-client-shortcuts` | yes | Application keyboard command registry and physical-key routing |
| `@supernova-ai/snh-client-ui-account-notifications` | yes | Display account notifications and refresh localized content |
| `@supernova-ai/snh-client-ui-action-cards` | no | Action cards below completed answers: the shared card frame, kind bodies and the layer that hides the answer blocks offering them |
| `@supernova-ai/snh-client-ui-agent-preset` | no | Agent-preset surfaces: the default for later sessions, this session's seat, and the composition editor |
| `@supernova-ai/snh-client-ui-agent-team` | no | Web shared task board for a subagent tree |
| `@supernova-ai/snh-client-ui-approval` | no | Approval composer takeover over the scoped Remote Event waterfall |
| `@supernova-ai/snh-client-ui-attachment` | no | Dynamic attachment presentation plugin for conversation input, message-image, and trajectory image slots |
| `@supernova-ai/snh-client-ui-brand-official` | no | Official SuperNova Harness brand artwork and click-triggered home background |
| `@supernova-ai/snh-client-ui-chat` | no | Chat Conversation target, node definitions, renderers, and details surface |
| `@supernova-ai/snh-client-ui-commands` | no | Client command surface: global directory cache, '/' source, three command UI kinds, popupSelect registry |
| `@supernova-ai/snh-client-ui-connector-account` | no | Connector account surfaces: the Host registry CLI app plugins and MCP connectors register their accounts with, and the Plugins page section, title tag, activation prompt, and notices it serves over one Remote |
| `@supernova-ai/snh-client-ui-context-menu` | yes | Typed, plugin-extensible context menus with captured targets and shared Web presentation |
| `@supernova-ai/snh-client-ui-conversation` | no | Target-neutral Conversation assembly, shell, composer, queue, and view navigation |
| `@supernova-ai/snh-client-ui-creation-recommendations` | no | Body of the personalized page card: location choice, creation progress, Undo and Restore |
| `@supernova-ai/snh-client-ui-deliverables` | no | Changed-files card with per-file comparison tabs, delivery cards, and clickable final-response file references for Web |
| `@supernova-ai/snh-client-ui-directory-picker-browse` | no | In-app directory browsing surface: the workspace directory-flow owner rendering the host's listing and creation primitives |
| `@supernova-ai/snh-client-ui-directory-picker-native` | no | Native directory-picker surface: the renderless workspace directory-flow occupant driving the local Desktop or Host OS chooser |
| `@supernova-ai/snh-client-ui-entry-customization` | no | Customize plugin entries in the left sidebar, conversation views, and right sidebar, and quickly create new plugins. |
| `@supernova-ai/snh-client-ui-file-actions` | no | Original-file saving and image clipboard actions for Web and Desktop |
| `@supernova-ai/snh-client-ui-file-drag` | no | Application-owned file drag transfers and localized failure feedback |
| `@supernova-ai/snh-client-ui-goal` | no | Session goal surface: GoalBar docked above the composer, read from the goal session projection |
| `@supernova-ai/snh-client-ui-input-trigger` | no | Input trigger pipeline: '/' and '@' detection, candidate menu, pick routing to registered sources |
| `@supernova-ai/snh-client-ui-jobs` | no | Session panel background-job list with on-demand streaming record panels |
| `@supernova-ai/snh-client-ui-layout` | no | Shell plugin: three-column AppFrame with drag handles, ctx.layout viewing-state service (navigation + panels) |
| `@supernova-ai/snh-client-ui-message-feedback` | no | The Web feedback surface: per-message Like/Dislike in the assistant-message action strip and the feedback dialog behind both ratings and /feedback, backed by the messageFeedback and sessionFeedback Host Remotes |
| `@supernova-ai/snh-client-ui-model-selection` | no | Model selection over the shared model catalog, Session projection, and session.selectModel |
| `@supernova-ai/snh-client-ui-open-in-app` | no | Session application submenus and native opening controls for directories and previewed files |
| `@supernova-ai/snh-client-ui-permission-presets` | no | Permission surfaces: a new-session default in General settings and a current-session /permission popup over the permissions projection |
| `@supernova-ai/snh-client-ui-plan` | no | Plan mode controls, persistent transcript plan cards, and sidebar Markdown previews |
| `@supernova-ai/snh-client-ui-plugin-manager` | yes | Plugin management for the snh web client: the sidebar Plugins panel installs, enables, disables, retries, and composes installed plugin packages |
| `@supernova-ai/snh-client-ui-plugin-market` | no | Discover tab of the snh web Plugins page: browse configured plugin market indexes and install their bundles |
| `@supernova-ai/snh-client-ui-plugin-recommendations` | no | Official plugin card body with catalog text and enabling |
| `@supernova-ai/snh-client-ui-reference` | no | Unified Web @file and @session reference source |
| `@supernova-ai/snh-client-ui-renderer` | no | Browser UI renderer: React slot bindings, ctx.uiRenderer, and the assembled application root |
| `@supernova-ai/snh-client-ui-schedule` | no | Host task management page and Session reminder catalog |
| `@supernova-ai/snh-client-ui-secret-mask` | no | Web display masking for recognized credentials in sent user text |
| `@supernova-ai/snh-client-ui-session` | no | Session Controller adapter for React and session-scoped slots |
| `@supernova-ai/snh-client-ui-session-panel` | no | Floating Session panel opened from the Session header, composed of sections that plugins register |
| `@supernova-ai/snh-client-ui-session-status` | no | Client Session status table over Host reading records: running state, the effective pending interaction, and read or unread reminders shared by clients of one Host |
| `@supernova-ai/snh-client-ui-settings` | no | Settings domain base plugin: shared configuration forms and the canonical settings slot-type contract |
| `@supernova-ai/snh-client-ui-settings-account` | yes | Manage SuperNova login and open Platform billing pages |
| `@supernova-ai/snh-client-ui-settings-agent-loop` | no | Settings page of the agent loop on the snh web client's Plugins page: the parallel tool-call cap of the agent-loop namespace |
| `@supernova-ai/snh-client-ui-settings-general` | no | Settings ownerless-copy and product onboarding plugin: the General section, shell trigger/header chrome content, settings dictionaries, and the versioned welcome notice |
| `@supernova-ai/snh-client-ui-settings-models` | yes | Models settings and shared product-onboarding dialogs over existing settings and credential joins |
| `@supernova-ai/snh-client-ui-settings-session-log` | no | General settings control for Session-log upload with SuperNova API requests |
| `@supernova-ai/snh-client-ui-settings-shell` | no | Settings page of the shell executor on the snh web client's Plugins page: the command timeout and the per-stream output cap of the shell namespace |
| `@supernova-ai/snh-client-ui-settings-subagent` | no | Settings page of Subagent delegation on the snh web client's Plugins page: recursion depth, parallel capacity, and the models agents may choose for subagents |
| `@supernova-ai/snh-client-ui-settings-web-search` | no | Settings page for web search and fetch on the snh web client's Plugins page: the Search and Fetch provider menus, the SuperNova Search API result count, SuperNova Search and Fetch API billing, and legacy Messages search settings |
| `@supernova-ai/snh-client-ui-shortcuts` | no | Keyboard shortcut reference, recording, and local preference editing |
| `@supernova-ai/snh-client-ui-sidebar` | no | Sidebar plugin: session multi-level tree, search, grouping, state dots |
| `@supernova-ai/snh-client-ui-sidebar-browser` | no | Sandboxed Web browser tabs for the right Sidebar |
| `@supernova-ai/snh-client-ui-sidebar-documentpreview` | yes | Extensible Sidebar previews for Office documents, spreadsheets, Markdown, code, images, PDF, HTML, and plain text |
| `@supernova-ai/snh-client-ui-sidebar-files` | no | The workspace files page and one workspace directory tree per pane beside docked and floating file previews, listed lazily over the workspaceFiles Remote namespace |
| `@supernova-ai/snh-client-ui-sidebar-right` | no | Right Sidebar: the docking surface's session-bound state, its panel and header expand control, and the navigation service over it |
| `@supernova-ai/snh-client-ui-sidebar-terminal` | no | Interactive shell tabs for the right Sidebar |
| `@supernova-ai/snh-client-ui-skill` | no | Web skill references and the dedicated skill tool row |
| `@supernova-ai/snh-client-ui-subagent` | no | Subagent conversation catalog, continuation routing UI, and '@' reference source |
| `@supernova-ai/snh-client-ui-theme` | yes | Theme plugin: Host bootstrap for the pre-plugin palette; ThemeRuntime for light/dark/system state and icon replacements; --dsw-* token styles and Appearance settings row |
| `@supernova-ai/snh-client-ui-tool` | no | Client Tool call-tree renderer and keyed per-tool presentation slot |
| `@supernova-ai/snh-client-ui-trajectory` | yes | Trajectory event ledger and timing overview with live tool-result inspection |
| `@supernova-ai/snh-client-ui-user-questions` | no | Web ask_user_question composer takeover and plan-review presentation UI |
| `@supernova-ai/snh-client-ui-workflow-run` | no | Durable workflow-run Conversation Node and nested member disclosure for snh web |
| `@supernova-ai/snh-client-ui-workspace` | no | Workspace picker plugin: one WorkspacePicker registered into the sidebar and empty-state workspace slots |

## compaction

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-command-compact` | no | Human-facing slash command for explicit session compaction |
| `@supernova-ai/snh-compaction-basic` | yes | Token-meter-driven compaction policy and LLM summarization backend for the SuperNova Harness |
| `@supernova-ai/snh-compaction-image-offload` | no | Durable image offload for image-capable routes: replace over-budget request images with placeholders and retry |
| `@supernova-ai/snh-compaction-tool-result-pruner` | yes | Replay-safe model-free head/middle/tail pruning for tool-result surface nodes |

## computer-use

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-computer-use` | no | Exclusive named computer-use provider registration |

## connector

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-cli-account` | yes | Host Service of CLI app plugins: each plugin registers its third-party CLI and account, and the Service gives the model the CLI's absolute path, runs one account operation at a time, and shows the account on the Plugins page |
| `@supernova-ai/snh-dingtalk` | yes | DingTalk plugin: the official dws CLI with its skills, and sign-in from the Plugins page |
| `@supernova-ai/snh-feishu` | yes | Feishu plugin: the official lark-cli with its embedded skills, and account connection from the Plugins page |
| `@supernova-ai/snh-linear` | yes | Linear plugin: Linear's hosted MCP server, authorized through the shared MCP manager |
| `@supernova-ai/snh-notion` | yes | Notion plugin: Notion's hosted MCP server, authorized through the shared MCP manager |
| `@supernova-ai/snh-tencent-docs` | yes | Tencent Docs plugin: Tencent Docs' hosted MCP server, authorized through the shared MCP manager |
| `@supernova-ai/snh-tencent-meeting` | yes | Tencent Meeting plugin: the official tmeet with its skill, and account connection from the Plugins page |
| `@supernova-ai/snh-upstream-skills` | yes | Host Service of CLI app plugins: each plugin registers its entry skill and a pinned directory of the vendor's GitHub repository, and the Service downloads that directory into the SNH cache and lists the entry skill over it |
| `@supernova-ai/snh-wecom` | yes | WeCom plugin: the official wecom-cli with its skills, and authorization from the Plugins page |

## context

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-agent-instructions` | yes | Workspace context loader for AGENTS.md/CLAUDE.md instruction files |
| `@supernova-ai/snh-file-reference-local` | yes | Local-filesystem ctx.fileReferences provider with bounded fuzzy indexes |
| `@supernova-ai/snh-harness-dev-context` | no | Model context naming the SuperNova Harness checkout and Web GUI URL without letting either change the system prompt |
| `@supernova-ai/snh-session-reference` | yes | Cross-session snapshot references and durable untrusted model context (ctx.sessionReferenceResolver) |
| `@supernova-ai/snh-time-context` | yes | Durable per-step context with the current time and elapsed time |
| `@supernova-ai/snh-tmux-context` | yes | Opt-in durable per-step context with this agent's tmux pane and window location |

## core

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-agent` | no | Agent interface, registry, initiator scope, and event vocabulary for the SuperNova Harness |
| `@supernova-ai/snh-agent-default-model` | yes | Default model selection shared by Agent entry points |
| `@supernova-ai/snh-agent-loop` | yes | The concrete agent loop plugin for the SuperNova Harness |
| `@supernova-ai/snh-agent-tool-presentation` | yes | Deprecated tool presentation selector; use snh-tool-executor-native or snh-tool-executor-ptc directly |
| `@supernova-ai/snh-session` | no | Event-sourced session store for the SuperNova Harness |
| `@supernova-ai/snh-system-prompt` | yes | System prompt assembly registry for the SuperNova Harness |
| `@supernova-ai/snh-tool-executor-native` | no | Native tool execution plugin |
| `@supernova-ai/snh-tool-executor-ptc` | yes | PTC program execution, tool bindings, and generated SDK prompts |
| `@supernova-ai/snh-tools` | no | Tool registry and execution pipeline for the SuperNova Harness |

## credentials

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-authorization` | no | Authorization seam (ctx.authorization): plugin-owned flows that obtain a credential through a conversation with the human |
| `@supernova-ai/snh-credentials-local` | yes | File-backed credentials provider ($SNH_HOME/.env under the live process environment) for the SuperNova Harness |

## deliverables

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-deliverable-file-references` | no | Shared model guidance for file links and deliverables across SuperNova Harness hosts |
| `@supernova-ai/snh-tool-present` | yes | Explicit workspace file delivery declarations for the SuperNova Harness |
| `@supernova-ai/snh-workspace-changes` | yes | Per-turn workspace file changes recorded from git working-tree snapshots and whole-file captures, with per-file comparisons, for the SuperNova Harness |

## document

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-office-kit` | yes | Shared Office rendering, conversion, and recalculation with bounded queues and caching |
| `@supernova-ai/snh-tool-office` | yes | Model-facing Office tools for rendering, converting, and recalculating documents |

## experimental

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-cua` | no | Shared Computer Use application objects, authorization, and logged tool execution |
| `@supernova-ai/snh-cua-macos` | yes | macOS native provider for shared Computer Use application and window objects |
| `@supernova-ai/snh-cua-mcp` | yes | Computer Use as an MCP stdio server: a snh profile bundle that exposes cua_run_code to external agent harnesses |
| `@supernova-ai/snh-cua-windows` | yes | Windows C# computer use through shared application and window objects |
| `@supernova-ai/snh-deepseek-chat-import` | yes | Import SuperNova chat exports as stored Sessions in a chosen Workspace |
| `@supernova-ai/snh-experimental-api-speech-to-text` | yes | Authenticated experimental speech transcription for browser clients |
| `@supernova-ai/snh-experimental-auto-review` | no | Per-tool LLM authorization review for the SuperNova Harness Auto permission preset |
| `@supernova-ai/snh-experimental-browser-use-chrome-devtools-mcp` | yes | Experimental per-Session Chromium browser tools through chrome-devtools-mcp |
| `@supernova-ai/snh-experimental-browser-use-playwright-mcp` | yes | Experimental per-Session Chromium browser tools through @playwright/mcp |
| `@supernova-ai/snh-experimental-browser-use-stagehand-native` | yes | Experimental Stagehand browser tools with separately configured native models |
| `@supernova-ai/snh-experimental-claude-code-mods` | yes | Experimental bridge: load Claude Code mods (hooks modules) and run their hook chains on SuperNova Harness extension points |
| `@supernova-ai/snh-experimental-client-ui-claude-code-mods` | no | Web band above the prompt for Claude Code mods: draws each session's mod tree and sends button presses back to the bridge |
| `@supernova-ai/snh-experimental-client-ui-cot-translation` | yes | Optional machine translation of expanded reasoning, preserving original Session text |
| `@supernova-ai/snh-experimental-client-ui-forge` | yes | Session panel entries for a Session's change requests, with a worktree option for new Sessions and its Host Remote |
| `@supernova-ai/snh-experimental-client-ui-stats` | no | Per-turn and per-step context, timing, cache, and tool-cost table contributed as an experimental conversation View |
| `@supernova-ai/snh-experimental-client-ui-voice-input` | no | Record speech and insert editable text into the conversation draft |
| `@supernova-ai/snh-experimental-computer-use-cua-driver-mcp` | yes | Experimental computer use through an installed Cua Driver MCP executable |
| `@supernova-ai/snh-experimental-computer-use-cua-driver-native` | no | Experimental computer-use provider embedding the Cua Driver native npm SDK |
| `@supernova-ai/snh-experimental-forge` | yes | Provider-neutral change request registry with shared status polling |
| `@supernova-ai/snh-experimental-forge-github` | yes | GitHub provider for the experimental forge registry, read through the GitHub CLI on the host |
| `@supernova-ai/snh-experimental-forge-session` | yes | Binds change requests to the Session that created, pushed, or tracked them |
| `@supernova-ai/snh-experimental-inspector` | yes | Experimental cross-realm CDP hub for Host debugging and Client Runtime inspection |
| `@supernova-ai/snh-experimental-session-inspector` | no | Experimental virtualized Session log and live Chat group/node inspectors |
| `@supernova-ai/snh-experimental-speech-to-text` | yes | Experimental speech recognition with independently selectable providers |
| `@supernova-ai/snh-experimental-speech-to-text-sensevoice` | yes | Local SenseVoice ONNX transcription with a managed sherpa-onnx process |
| `@supernova-ai/snh-experimental-subagent-oar` | yes | Experimental one-shot subagents through OAR runtimes |
| `@supernova-ai/snh-experimental-tool-subagent-oar` | yes | Delegate standalone tasks to configured external subagent providers |
| `@supernova-ai/snh-experimental-tool-worktree` | no | Model tool that creates and enters a new Git worktree |
| `@supernova-ai/snh-experimental-translator` | yes | Machine translation with reusable Session results |
| `@supernova-ai/snh-experimental-worktree` | yes | Creates a named Git worktree and changes the calling Session working directory |
| `@supernova-ai/snh-forge-gitlab` | yes | GitLab provider for the experimental forge registry, read and written through the GitLab CLI on the host |
| `@supernova-ai/snh-hooks-claude-code` | yes | Bridge plugin: run a Claude Code hooks.json / settings hook config on the SuperNova Harness interception seams |
| `@supernova-ai/snh-hooks-codex` | yes | Bridge plugin: run a Codex hooks.json hook config on the SuperNova Harness interception seams |
| `@supernova-ai/snh-session-title-all-prompts-llm` | yes | All-user-messages LLM provider plugin for SuperNova Harness session titles |
| `@supernova-ai/snh-skill-badge` | no | Bundled snh badge skill provider for SuperNova Harness |
| `@supernova-ai/snh-terminal-panel` | yes | Persistent Agent terminals shown in the Web sidebar, plus read-only access to the user's terminals |
| `@supernova-ai/snh-timeline` | yes | Replace Todo in long-running sessions with task trees, a live progress bar, and timed reports |
| `@supernova-ai/snh-tool-ralph` | yes | Model-facing fresh-agent Ralph loop over the workflow and subagent seams |
| `@supernova-ai/snh-tool-session-query` | yes | Workspace-authorized model-facing session history search, trace, and event read tools |
| `@supernova-ai/snh-tool-terminal` | yes | Six model-facing persistent PTY tools with owner isolation and generic background-job integration |
| `@supernova-ai/snh-webhook` | no | Fire-and-forget webhook rule runtime that creates Workspace-backed SuperNova Harness Sessions |
| `@supernova-ai/snh-webhook-github` | yes | Signed GitHub HTTP webhook adapter for the SuperNova Harness webhook runtime |

## extensions

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-client-ui-cordis` | no | Cordis dynamic-plugin definition card: the keyed cordis_define tool row with its run/stop switch |
| `@supernova-ai/snh-cordis-client-runner` | no | Browser half of dynamic dual-half plugin packages: event subscription, closure evaluation, guard facade, and loader entries |
| `@supernova-ai/snh-cordis-host-runner` | yes | Dynamic package definition registry, host-half sandbox lifecycle, and invoke handler table for model-mounted dual-half packages |
| `@supernova-ai/snh-creation-recommendations` | no | Create persistent removable interface plugins from explicit conversation needs |
| `@supernova-ai/snh-plugin-recommendations` | no | Official plugin suggestions with explicit user activation and persistent conversation decisions |
| `@supernova-ai/snh-tool-cordis` | no | Read-only runtime API inspection for Harness plugin development |

## feedback

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-command-feedback` | no | Log-only session feedback: the record event, the sessionFeedback Host Remote, and the human-facing slash command |
| `@supernova-ai/snh-message-feedback` | yes | Canonical Session-log ratings and notes for finalized assistant messages |

## fs

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-fs-local` | yes | Local-filesystem implementation of the SuperNova Harness filesystem seam (ctx.fs) |
| `@supernova-ai/snh-fs-observation-policy` | no | File-context policy plugin for the SuperNova Harness — observed-state, read-before-edit, and version-guarded write/edit added over the ctx.fs provider seam through the fs/* event gate (no service API) |
| `@supernova-ai/snh-fs-sandbox` | yes | Sandbox-enforcing implementation of the SuperNova Harness filesystem seam: fences write/edit by the per-call sandbox mode (read-only denies mutation, workspace-write contains it to the workspace + temp roots) while reads pass through |
| `@supernova-ai/snh-tool-fs` | yes | Model-facing filesystem tools (read, write, edit) over the SuperNova Harness filesystem seam (ctx.fs) |
| `@supernova-ai/snh-tool-fs-search` | yes | Model-facing filesystem discovery tools (glob, grep) backed by the packaged ripgrep binary (@vscode/ripgrep) |
| `@supernova-ai/snh-tool-str-replace-editor` | yes | Model-facing view, create, literal replace, and line insert tool over the Harness filesystem service |

## goal

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-command-goal` | no | Human-facing slash command for persisted same-session goals |
| `@supernova-ai/snh-goal` | yes | Event-sourced same-session goal state and lifecycle service for the SuperNova Harness |
| `@supernova-ai/snh-goal-round-driver` | no | Race-fenced same-session goal-round driver |
| `@supernova-ai/snh-tool-goal` | yes | Model-facing same-session goal tools with execution-time authority checks |

## guard

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-repeat-tool-reminder` | yes | Repeat-tool-call guard plugin: advisory reminders when an agent loops on identical tool calls |
| `@supernova-ai/snh-tool-call-timeout-policy` | no | Tool-call timeout policy: a tools/execute wrapper that arms a per-tool deadline on exec.signal and returns TOOL_TIMEOUT when it wins |

## host

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-host-authentication-desktop` | yes | Desktop private-channel authentication provider |
| `@supernova-ai/snh-host-authentication-token` | yes | Default token authentication provider and HTTP cookie exchange |
| `@supernova-ai/snh-host-directory-picker-auto` | no | Adaptive chooser of the directory-picker seam: resolves the host situation at boot and mounts the native or browse backend for the SuperNova Harness web GUI host |
| `@supernova-ai/snh-host-directory-picker-browse` | yes | In-app browsing backend of the directory-picker seam (listing/creation primitives over the host filesystem) |
| `@supernova-ai/snh-host-directory-picker-native` | no | Native-OS-chooser backend of the directory-picker seam for the SuperNova Harness web GUI host |
| `@supernova-ai/snh-host-frontend-static` | yes | SPA dist server for the Web shell: owns the webserver fallback seat, serving explicit index entries and static assets with traversal rejection and 404 misses |
| `@supernova-ai/snh-host-open-in-app` | yes | Host half of open-in-app: resolved application catalog, icons, and the launch endpoint as three webServer routes |
| `@supernova-ai/snh-host-plugin-inventory` | no | Read-only Remote projection of current Cordis Loader plugin state |
| `@supernova-ai/snh-host-product-telemetry-otel` | yes | Explicit product usage events exported through OpenTelemetry HTTP logs |
| `@supernova-ai/snh-host-webserver` | yes | Web route-registration plugin: HTTP and upgrade routes, per-Peer index transform taps, and static dist fallback |

## interaction

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-action-cards` | yes | Optional action cards below answers: card state, user actions and status notices |
| `@supernova-ai/snh-commands` | no | Plugin-owned human command registry for SuperNova Harness UIs |
| `@supernova-ai/snh-permission-presets` | yes | User-facing permission presets (ctx.permissionPresets) for the SuperNova Harness: one product-level Permissions select bundling the sandbox-mode and approval-policy knobs, written through to their own session events |
| `@supernova-ai/snh-tool-ask-user` | yes | Model-facing ask_user_question tool over the ctx.userQuestions seam |
| `@supernova-ai/snh-user-approval` | yes | User-approval seam (ctx.approval) for the SuperNova Harness: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default |
| `@supernova-ai/snh-user-questions` | no | Abstract user-questions seam (ctx.userQuestions) for asking the human during agent runs |

## jobs

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-jobs-local` | yes | Process-local implementation of the SuperNova Harness background job registry seam |
| `@supernova-ai/snh-tool-jobs` | yes | Model-facing background job control tools (job_output, job_list, job_kill) over the ctx.jobs registry |

## llm

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-llm` | no | Provider-neutral LLM service interface for the SuperNova Harness |
| `@supernova-ai/snh-llm-deepseek-account` | yes | SuperNova account provider authentication and discovery |
| `@supernova-ai/snh-llm-pi-ai` | yes | pi-ai-backed SuperNova adapter for the SuperNova Harness LLM seam (design-verification twin of snh-llm-supernova) |
| `@supernova-ai/snh-llm-retry` | yes | Provider-routed LLM request retry policy for the SuperNova Harness |
| `@supernova-ai/snh-llm-deepseek-api-key` | yes | SuperNova api-key provider authentication and discovery |
| `@supernova-ai/snh-plugin-package-inventory-supernova` | yes | Active Loader-backed plugin package inventory for official SuperNova LLM API requests |
| `@supernova-ai/snh-supernova-llm-api-extensions` | no | Additive request-field registry for the official SuperNova LLM API adapter |
| `@supernova-ai/snh-token-meter` | yes | Replay-aware token measurement service (ctx.tokenMeter) for the SuperNova Harness |

## lsp

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-lsp` | no | Abstract LSP capability seam (ctx.lsp) for the SuperNova Harness — language-server provider registry keyed by branded id and extension mapping, order-independent per-query selection, normalized definition/references/implementation/hover requests and results, and the LspError taxonomy |
| `@supernova-ai/snh-lsp-stdio` | yes | Generic stdio language-server provider for the SuperNova Harness LSP capability seam (ctx.lsp) — spawns configured servers, translates JSON-RPC, and serves transient-open goToDefinition/findReferences/goToImplementation/hover queries in the host filesystem namespace |
| `@supernova-ai/snh-tool-lsp` | yes | Model-facing lsp tool over the SuperNova Harness LSP capability seam (ctx.lsp) — one read-only tool with goToDefinition/findReferences/goToImplementation/hover operations, one-based UTF-16 cursor coordinates, bounded location rendering, and hover normalization |

## mcp

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-mcp-account` | no | MCP connector accounts on the Plugins page: each connector's OAuth server in the connector account registry, authorized through the MCP manager |
| `@supernova-ai/snh-mcp-client` | yes | MCP client bridge: connects to MCP servers and registers their tools on ctx.tools |
| `@supernova-ai/snh-mcp-manager` | yes | MCP server manager: a settings-driven fleet of mcp-client instances with runtime status, restart, and probe |
| `@supernova-ai/snh-mcp-resources` | no | Scoped MCP resource discovery and reading through shared model tools |

## plan

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-plan-mode` | yes | Logged per-agent plan mode with deployment guidance, a direct slash command, and a user-reviewed exit |

## preset

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-agent-preset` | yes | Declare an Agent capability composition in Cordis YAML |
| `@supernova-ai/snh-agent-preset-registry` | yes | Declarative Agent preset registry and profile-backed editing |
| `@supernova-ai/snh-persona` | yes | Composition-authored deployment persona section for the SuperNova Harness |

## ptc-runtime

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-ptc-runtime-node` | yes | Node PTC execution with async function, REPL, scoped REPL and VM Script evaluators and optional retained state |

## sandbox

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-sandbox-local` | yes | Local process-sandbox backends for the SuperNova Harness sandbox seam: bwrap, the npm-distributed landlock-run launcher, macOS Seatbelt, or the Windows ACL restricted-token runner — functionally probed, fail-closed |
| `@supernova-ai/snh-sandbox-policy` | yes | Per-call sandbox policy resolver and current model context: deployment fallbacks plus each session's mode and workspace root, shared by every enforcing capability family |

## schedule

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-schedule` | yes | Host-wide durable reminders with shared management and delivery to existing or new Sessions |
| `@supernova-ai/snh-tool-schedule` | no | Model-facing scheduled task tools (schedule_create, schedule_list, schedule_view, schedule_edit) over the Host ctx.schedule service |

## sdk

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-sdk-jsonrpc-server` | yes | Stdio JSON-RPC server plugin for out-of-process SuperNova Harness SDK clients |

## session

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-message-quotes` | no | Selected-text quotation and Markdown blockquote presentation |
| `@supernova-ai/snh-session-checkpoint-policy` | no | Semantic session durability checkpoints before model requests and tool side effects |
| `@supernova-ai/snh-session-log-supernova` | yes | Incremental lossless session-log request extension for the official SuperNova LLM API |
| `@supernova-ai/snh-session-persistence-jsonl` | yes | JSONL durable session persistence backend for the SuperNova Harness |
| `@supernova-ai/snh-session-persistence-sqlite` | yes | SQLite Session event storage backend for the SuperNova Harness |
| `@supernova-ai/snh-session-projection` | no | Session-projection seam: the merge-extensible projection type table, the provider contract, and the ctx.sessionProjections registry serving whole current values of log-derived per-session state |
| `@supernova-ai/snh-session-projection-cache` | yes | Persisted projection cache (ctx.sessionProjectionCache): durable per-session checkpoint records on the session_projcache storage domain (per-record layout), throttled write-behind, and the cached listing read |
| `@supernova-ai/snh-session-stats` | no | Whole-log conversation counts and wall times projection (sessionStats) for the SuperNova Harness |
| `@supernova-ai/snh-session-telemetry-otel` | yes | Feedback-authorized Session logs over byte-bounded OpenTelemetry HTTP requests |
| `@supernova-ai/snh-session-title` | yes | Log-backed session title service and provider registry for the SuperNova Harness |
| `@supernova-ai/snh-session-title-first-prompt-llm` | yes | First-message LLM provider plugin for SuperNova Harness session titles |
| `@supernova-ai/snh-session-turn-outline` | no | Whole-log turn outline projection (turnOutline) for the SuperNova Harness |
| `@supernova-ai/snh-tool-session-control` | no | Send model-authored messages to ordinary Web Sessions with acceptance receipts |
| `@supernova-ai/snh-working-directory` | yes | Session working directories with durable changes and model context |

## session-query

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-session-log-export` | yes | Web Session-log ZIP export and Session Markdown copy |
| `@supernova-ai/snh-session-query-sqlite` | yes | Concrete ctx.sessionQuery backend with SQLite FTS5 search |
| `@supernova-ai/snh-tool-session-list` | no | Read-only paginated Workspace and Session metadata tools |

## settings

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-settings` | no | Abstract user-settings seam (ctx.settings) for the SuperNova Harness |

## shell

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-bash-local` | yes | Local-subprocess implementation of the SuperNova Harness bash executor seam |
| `@supernova-ai/snh-bash-sandbox` | yes | Sandbox-consuming implementation of the SuperNova Harness bash executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts) |
| `@supernova-ai/snh-pwsh-local` | yes | Local PowerShell implementation of the SuperNova Harness bash executor seam |
| `@supernova-ai/snh-pwsh-sandbox` | yes | Sandbox-consuming implementation of the SuperNova Harness PowerShell executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts) |
| `@supernova-ai/snh-shell-env` | yes | Tool-independent managed SNH_* shell environment registry |
| `@supernova-ai/snh-tool-bash` | yes | Model-facing bash tool with optional generic background-job and sandbox-escalation support |
| `@supernova-ai/snh-tool-bash-persistent` | yes | Model-facing owner-scoped persistent Bash tool backed by the Harness PTY service |
| `@supernova-ai/snh-tool-pwsh` | yes | Model-facing pwsh tool over the bash executor seam |
| `@supernova-ai/snh-tool-pwsh-persistent` | yes | Model-facing owner-scoped persistent PowerShell tool backed by the Harness PTY service |

## skill

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-skill` | yes | Agent skill provider registry for the SuperNova Harness |
| `@supernova-ai/snh-skill-filesystem` | yes | Local filesystem skill provider for the SuperNova Harness |
| `@supernova-ai/snh-skill-office` | yes | Bundled Word, PowerPoint, and Excel workflows and Office operation guidance |
| `@supernova-ai/snh-tool-skill` | yes | Model-facing skill loading tool for the SuperNova Harness |
| `@supernova-ai/snh-tool-workspace-dependencies` | yes | The load_workspace_dependencies tool: absolute paths into a bundled Python, Node.js, and pnpm payload |

## spill

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-spill-local` | yes | Local-filesystem implementation of the SuperNova Harness spill storage seam (private session-scoped files) |
| `@supernova-ai/snh-spill-policy` | yes | Token-budgeted tool-result retention with recoverable text and image paths |

## ssh

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-fs-ssh` | no | Filesystem provider over the shared POSIX SSH helper |
| `@supernova-ai/snh-sandbox-ssh` | no | Remote POSIX sandbox argv provider over the shared SSH helper |
| `@supernova-ai/snh-ssh` | yes | Shared OpenSSH connection and versioned POSIX remote helper |
| `@supernova-ai/snh-subprocess-ssh` | no | Subprocess and terminal provider over the shared POSIX SSH helper |

## storage

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-storage` | no | Storage hub (ctx.storage): named backend registry plus mounted data-form facilities for the SuperNova Harness |
| `@supernova-ai/snh-storage-domain` | yes | Domain data form (ctx.storage.domain): schema-validated, event-emitting KV domains over storage backends for the SuperNova Harness |
| `@supernova-ai/snh-storage-json` | yes | JSON file KV storage backend for the SuperNova Harness storage hub |
| `@supernova-ai/snh-storage-sqlite` | yes | SQLite storage backend (kv facet) for the SuperNova Harness storage hub |

## subagent

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-subagent` | yes | Abstract subagent seam (ctx.subagents): named-provider registry for delegating to child agents |
| `@supernova-ai/snh-subagent-acp` | yes | Out-of-process ACP subagent backend: drives a child agent in a spawned subprocess over the Agent Client Protocol |
| `@supernova-ai/snh-subagent-claude-code` | yes | One-shot Claude Code subagent provider over the official Agent SDK |
| `@supernova-ai/snh-subagent-codex` | yes | One-shot Codex subagent provider over the official app-server protocol |
| `@supernova-ai/snh-subagent-fork-in-process` | yes | In-process fork subagent backend: runs a child agent seeded with a prefix of the parent's log |
| `@supernova-ai/snh-subagent-snh-sdk` | yes | Out-of-process SDK subagent backend: drives a child SuperNova Harness runtime subprocess over stdio JSON-RPC through the TypeScript SDK client |
| `@supernova-ai/snh-subagent-spawn-in-process` | yes | In-process spawn subagent backend: runs a fresh child agent on ctx.agents |
| `@supernova-ai/snh-tool-subagent` | yes | Model-facing subagent delegation tool over the ctx.subagents seam |
| `@supernova-ai/snh-tool-subagent-control` | yes | Shared messaging, interruption, and child discovery tools for subagents |

## subprocess

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-subprocess-local` | no | Local-subprocess implementation of the SuperNova Harness subprocess seam |

## team

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-agent-team` | yes | Shared task DAG and change waits for subagent trees |
| `@supernova-ai/snh-tool-agent-team` | yes | Scoped model-facing Agent Teams tools over ctx.agentTeams |

## telemetry

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-otel` | no | Cordis service for independent ordinary-event and byte-bounded Session-log OTLP channels |

## terminal

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-terminal` | no | Persistent PTY session seam for the SuperNova Harness — owner-scoped ids, backend registry, interactive sends, reads, signals, and awaited cleanup |
| `@supernova-ai/snh-terminal-bash` | yes | Persistent shell PTY backend over the SuperNova Harness subprocess terminal primitive |

## test-support

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-llm-replay` | yes | Replay LLM plugin: short-circuits llm/stream with model chunks reconstructed from a recorded session JSONL (keyless snapshot tests) |

## todo

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-tool-todo` | yes | Model-facing todo_write tool over the SuperNova Harness event-sourced session log |

## typert

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-typert-loader` | yes | Loader integration for generated Typert package contributions |

## web

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-tool-web` | yes | Model-facing web tools (web_search, web_fetch) over the SuperNova Harness web capability seam (ctx.web) |
| `@supernova-ai/snh-web` | yes | Abstract web access capability seam (ctx.web) for the SuperNova Harness — search/fetch provider registry, registration-order-independent selection, request/result vocabulary, and the WebError taxonomy |
| `@supernova-ai/snh-web-fetch-http` | yes | Anonymous HTTP(S) fetch provider for the SuperNova Harness web capability seam (ctx.web) |
| `@supernova-ai/snh-web-search-supernova` | yes | SuperNova-backed search provider (native web_search via the Anthropic-compatible API) for the SuperNova Harness web capability seam (ctx.web) |
| `@supernova-ai/snh-web-supernova-api` | yes | SuperNova Search and Fetch API providers for the SuperNova Harness web capability seam (ctx.web) |

## workflow

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-tool-workflow` | yes | Model-facing workflow tool: run a JavaScript orchestration script over ctx.workflowEngine |
| `@supernova-ai/snh-workflow-ptc` | yes | Workflow orchestration in the shared sandboxed Node PTC runtime |

## workspace

| Package | Config | Description |
|---|---|---|
| `@supernova-ai/snh-workspace` | no | Workspace entity registry (ctx.workspaceRegistry): durable workspace records with validated session attachment over the domain data form for the SuperNova Harness |
