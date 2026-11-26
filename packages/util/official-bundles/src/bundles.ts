/** The bundle package names the snh installation selects, offers, installs on demand, or retires. */

/** Installation-owned defaults used when a shipped profile is first opened. */
export interface ProfileTemplate {
  /** Ordered bundle layer list. */
  bundles: readonly string[]
}

/** The shipped profile templates auto-initialized on first use, by name. */
export const PROFILE_TEMPLATES: Record<string, ProfileTemplate> = {
  acp: {
    bundles: ['@supernova-ai/snh-base', '@supernova-ai/snh-acp-app'],
  },
  web: {
    bundles: ['@supernova-ai/snh-base', '@supernova-ai/snh-web-app'],
  },
  headless: {
    bundles: ['@supernova-ai/snh-base', '@supernova-ai/snh-headless'],
  },
  sdk: {
    bundles: ['@supernova-ai/snh-base', '@supernova-ai/snh-sdk-app'],
  },
  'sdk-minimal': {
    bundles: ['@supernova-ai/snh-sdk-minimal'],
  },
}

/**
 * Installation-owned bundle tuples that an earlier release wrote into a shipped profile; app-boot replaces an exact
 * match with the {@link PROFILE_TEMPLATES} entry of the same name and leaves every other list untouched.
 */
export const INSTALLATION_OWNED_PROFILE_TUPLES: Readonly<Record<string, readonly string[]>> = {
  headless: ['@supernova-ai/snh-base', '@supernova-ai/snh-web-app', '@supernova-ai/snh-headless'],
}

/** Bundles an earlier release shipped and the installation no longer carries; app-boot removes them from profiles. */
export const RETIRED_BUNDLES: ReadonlySet<string> = new Set([
  // The Web composition mounts Schedule itself
  // ([upgrade guide](../../../../docs/upgrade-guide/v0.2.0-rc.2/schedule-bundle-retired/guide.md)).
  '@supernova-ai/snh-experimental-schedule-bundle',
  '@supernova-ai/snh-experimental-agent-team-profile',
  // The Web composition mounts personalized recommendations itself
  // ([upgrade guide](../../../../docs/upgrade-guide/v0.2.2-rc.5/personalized-recommendations-bundle-retired/guide.md)).
  '@supernova-ai/snh-personalized-recommendations',
])

/** The bundle list a `snh plugin` init uses for a name with no shipped template. */
export const DEFAULT_PROFILE_BUNDLES: readonly string[] = ['@supernova-ai/snh-base']

/**
 * The bundles the snh installation ships for a person to switch on: each a
 * runtime dependency of the installation that declares `snh.bundle.patch`,
 * an `icon`, and `./locale/*.json` display metadata, selected by no shipped
 * template, and offered switched off by the plugin manager when listed
 * ([rationale](../../../../.agents/notes/implemented/process/2026-09-15-shipped-optional-bundles.md),
 * [admission](../../../../.agents/notes/implemented/architecture/2026-09-21-experimental-capabilities-as-optional-bundles.md)).
 */
export const OPTIONAL_BUNDLES: readonly string[] = [
  '@supernova-ai/snh-cua-bundle',
  '@supernova-ai/snh-cua-mcp',
  '@supernova-ai/snh-timeline',
  '@supernova-ai/snh-experimental-session-search',
  '@supernova-ai/snh-experimental-ralph-bundle',
  '@supernova-ai/snh-experimental-terminal-bundle',
  '@supernova-ai/snh-experimental-badge-skill-bundle',
  '@supernova-ai/snh-experimental-session-titles-bundle',
  '@supernova-ai/snh-experimental-voice-input-bundle',
  '@supernova-ai/snh-experimental-cot-translation-bundle',
  '@supernova-ai/snh-experimental-auto-review',
  '@supernova-ai/snh-experimental-inspector-profile',
  '@supernova-ai/snh-experimental-liveshare',
  '@supernova-ai/snh-experimental-plugin-market-bundle',
  '@supernova-ai/snh-experimental-tool-worktree',
  '@supernova-ai/snh-experimental-forge-bundle',
  '@supernova-ai/snh-deepseek-chat-import',
]

/** Public SNH release members available through the ordinary on-demand bundle installer. */
export const ON_DEMAND_BUNDLES: readonly string[] = [
  '@supernova-ai/snh-subagent-claude-code',
  '@supernova-ai/snh-subagent-codex',
]
