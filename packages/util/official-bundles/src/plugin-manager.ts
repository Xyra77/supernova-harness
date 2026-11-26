/** The package names the plugin manager protects, hides, orders, or marks experimental. */

/**
 * Plugin packages the plugin manager refuses to disable or remove, because management itself needs them; a bundle that
 * contains one is read-only as well. Removing a name drops only this `management-required` refusal; the manager's own
 * entry, installation-carried bundles, and unaddressable rows stay protected by their own rules.
 */
export const PROTECTED_PLUGINS: ReadonlySet<string> = new Set([
  '@supernova-ai/snh-plugin-manager', '@supernova-ai/cordis-plugin-loader',
  '@supernova-ai/cordis-plugin-include', '@supernova-ai/snh-api-gateway',
  '@supernova-ai/snh-host-webserver', '@supernova-ai/snh-client-modules',
  '@supernova-ai/snh-client-ui-plugin-manager',
  '@supernova-ai/snh-host-plugin-inventory', '@supernova-ai/snh-typert-registry',
  '@supernova-ai/snh-api-remotes', '@supernova-ai/snh-api-remote-access',
  '@supernova-ai/cordis-plugin-timer', '@supernova-ai/snh-client-connection',
  '@supernova-ai/snh-host-frontend-static', '@supernova-ai/snh-tools',
  '@supernova-ai/snh-hmr',
])

/**
 * Built-in profile bundles, the standalone worktree tool, and the Computer Use MCP profile
 * bundle, which have no plugin manager page.
 * Their Host availability and activation stay intact.
 */
export const HIDDEN_BUNDLES: ReadonlySet<string> = new Set([
  '@supernova-ai/snh-base',
  '@supernova-ai/snh-web-app',
  '@supernova-ai/snh-headless',
  '@supernova-ai/snh-sdk-app',
  '@supernova-ai/snh-acp-app',
  '@supernova-ai/snh-sdk-minimal',
  '@supernova-ai/snh-experimental-tool-worktree',
  '@supernova-ai/snh-cua-mcp',
])

/**
 * The optional bundles the plugin manager's main and More lists rank first, in this order. {@link MORE_BUNDLES}, not
 * this list, decides whether a bundle appears on the main list.
 */
export const EXTENSION_BUNDLES: readonly string[] = [
  '@supernova-ai/snh-experimental-voice-input-bundle',
  '@supernova-ai/snh-experimental-plugin-market-bundle',
  '@supernova-ai/snh-experimental-auto-review',
]

/**
 * The optional bundles the plugin manager's main list leaves out until the profile enables them; its More list,
 * which includes every eligible bundle, ranks them last in this order.
 */
export const MORE_BUNDLES: readonly string[] = [
  '@supernova-ai/snh-experimental-inspector-profile',
  '@supernova-ai/snh-cua-bundle',
  '@supernova-ai/snh-timeline',
  '@supernova-ai/snh-experimental-terminal-bundle',
  '@supernova-ai/snh-experimental-cot-translation-bundle',
  '@supernova-ai/snh-experimental-session-search',
  '@supernova-ai/snh-experimental-session-titles-bundle',
  '@supernova-ai/snh-experimental-badge-skill-bundle',
  '@supernova-ai/snh-experimental-ralph-bundle',
  '@supernova-ai/snh-deepseek-chat-import',
  '@supernova-ai/snh-subagent-codex',
  '@supernova-ai/snh-subagent-claude-code',
]

/** Official bundles the plugin manager marks with the Experimental badge. */
export const EXPERIMENTAL_BUNDLES: ReadonlySet<string> = new Set([
  '@supernova-ai/snh-cua-bundle',
  '@supernova-ai/snh-cua-mcp',
  '@supernova-ai/snh-timeline',
  '@supernova-ai/snh-experimental-terminal-bundle',
  '@supernova-ai/snh-experimental-voice-input-bundle',
  '@supernova-ai/snh-experimental-auto-review',
  '@supernova-ai/snh-experimental-inspector-profile',
  '@supernova-ai/snh-experimental-forge-bundle',
  '@supernova-ai/snh-experimental-tool-worktree',
  '@supernova-ai/snh-experimental-cot-translation-bundle',
  '@supernova-ai/snh-experimental-session-search',
  '@supernova-ai/snh-experimental-session-titles-bundle',
  '@supernova-ai/snh-experimental-badge-skill-bundle',
  '@supernova-ai/snh-experimental-ralph-bundle',
  '@supernova-ai/snh-experimental-plugin-market-bundle',
  '@supernova-ai/snh-experimental-liveshare',
  '@supernova-ai/snh-deepseek-chat-import',
])
