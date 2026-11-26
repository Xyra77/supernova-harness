/** The standalone SDK-minimal bundle's complete declared Cordis tree. */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseEntryYaml } from '@supernova-ai/cordis-plugin-include'

function packageName(specifier: string): string {
  return specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]!
}

describe('snh-sdk-minimal bundle', () => {
  it('declares one standalone allowlisted tree with every row dependency', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      snh?: { bundle?: { patch?: string } }
    }
    expect(manifest.snh?.bundle?.patch).toBe('./cordis.patch.yml')
    const patches = parseEntryYaml(readFileSync(resolve(root, manifest.snh!.bundle!.patch!), 'utf8')) as Array<{ insert?: Array<{ id?: string; inject?: string[]; name?: string; config?: Record<string, unknown>; disabled?: unknown }> }>
    expect(patches).toHaveLength(1)
    const rows = patches[0]?.insert ?? []
    expect(rows.map(row => [row.id, row.name])).toEqual([
      ['sdk-app-startup', '@supernova-ai/snh-sdk-app'],
      ['sdk-jsonrpc-server', '@supernova-ai/snh-sdk-jsonrpc-server'],
      ['supernova-llm-api-extensions', '@supernova-ai/snh-supernova-llm-api-extensions'],
      ['session-log-supernova', '@supernova-ai/snh-session-log-supernova'],
      ['plugin-package-inventory-supernova', '@supernova-ai/snh-plugin-package-inventory-supernova'],
      ['supernova-auth', '@supernova-ai/snh-supernova-auth'],
      ['llm-supernova', '@supernova-ai/snh-llm-supernova-api-key'],
      ['sandbox', '@supernova-ai/snh-sandbox-local'],
      ['filesystem', '@supernova-ai/snh-fs-local'],
      ['attachment-local', '@supernova-ai/snh-attachment-local'],
      ['tool-fs', '@supernova-ai/snh-tool-fs'],
      ['working-directory', '@supernova-ai/snh-working-directory'],
      ['session-projection', '@supernova-ai/snh-session-projection'],
      ['token-meter', '@supernova-ai/snh-token-meter'],
      ['compaction-basic', '@supernova-ai/snh-compaction-basic'],
      ['image-offload', '@supernova-ai/snh-compaction-image-offload'],
      ['sandbox-policy', '@supernova-ai/snh-sandbox-policy'],
      ['subprocess', '@supernova-ai/snh-subprocess-local'],
      ['pty', '@supernova-ai/snh-terminal'],
      ['terminal-bash', '@supernova-ai/snh-terminal-bash'],
      ['terminal-pwsh', '@supernova-ai/snh-terminal-bash'],
      ['timer', '@supernova-ai/cordis-plugin-timer'],
      ['llm', '@supernova-ai/snh-llm'],
      ['session', '@supernova-ai/snh-session'],
      ['session-title', '@supernova-ai/snh-session-title'],
      ['system-prompt', '@supernova-ai/snh-system-prompt'],
      ['tools', '@supernova-ai/snh-tools'],
      ['tool-executor-native', '@supernova-ai/snh-tool-executor-native'],
      ['mcp-resources', '@supernova-ai/snh-mcp-resources'],
      ['agent', '@supernova-ai/snh-agent'],
      ['llm-retry', '@supernova-ai/snh-llm-retry'],
      ['jobs', '@supernova-ai/snh-jobs-local'],
      ['agent-loop', '@supernova-ai/snh-agent-loop'],
      ['persistent-bash', '@supernova-ai/snh-tool-bash-persistent'],
      ['persistent-pwsh', '@supernova-ai/snh-tool-pwsh-persistent'],
      ['sessions', '@supernova-ai/snh-session-persistence-jsonl'],
      ['session-checkpoint-policy', '@supernova-ai/snh-session-checkpoint-policy'],
    ])
    expect(rows.find(row => row.id === 'sdk-app-startup')?.config).toEqual({ profile: 'sdk-minimal' })
    expect(rows.find(row => row.id === 'sdk-jsonrpc-server')).toMatchObject({
      inject: ['sdkAppStartup', 'loader'],
      config: { maxTokensAsSuccess: false },
    })
    expect(rows.find(row => row.id === 'llm-supernova')?.config).toEqual({
      apiKeyEnv: 'DEEPSEEK_API_KEY',
      defaultContextWindow: { __jsExpr: 'Number(process.env.SNH_CONTEXT_WINDOW ?? 1000000)' },
      streamIdleTimeoutMs: 172800000,
    })
    expect(rows.find(row => row.id === 'system-prompt')?.config).toEqual({
      includeHarnessIdentity: false,
      includeRuntimeContext: false,
      personaPrefix: { __jsExpr: "process.env.SNH_SYSTEM_PROMPT ?? 'You are a helpful software engineer assistant.'" },
    })
    expect(rows.find(row => row.id === 'agent-loop')?.config).toEqual({ agents: [] })
    expect(rows.find(row => row.id === 'tool-fs')?.config).toEqual({ read: false, readImage: true, write: false, edit: false })
    expect(rows.find(row => row.id === 'compaction-basic')?.config).toBeUndefined()
    expect(rows.find(row => row.id === 'terminal-bash')).toMatchObject({
      disabled: { __jsExpr: "process.platform === 'win32'" },
    })
    expect(rows.find(row => row.id === 'terminal-pwsh')).toMatchObject({
      disabled: { __jsExpr: "process.platform !== 'win32'" },
      config: { shellDialect: 'pwsh', timeoutMs: 300000 },
    })
    expect(Object.keys(manifest.dependencies ?? {}).sort()).toEqual(
      [...new Set(rows.map(row => row.name).filter((name): name is string => name !== undefined).map(packageName))].sort(),
    )
  })
})
