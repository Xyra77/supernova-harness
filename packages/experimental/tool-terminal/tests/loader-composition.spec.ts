import { executeToolFixture } from '@supernova-ai/snh-tool-testkit'
import * as NativeToolExecutor from '@supernova-ai/snh-tool-executor-native'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { unsupportedModel, provideWorkingDirectoryFixture, unsupportedInbox } from '@supernova-ai/snh-agent-loop-testkit'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import Loader from '@supernova-ai/cordis-plugin-loader'
import Include from '@supernova-ai/cordis-plugin-include'
import { brandString } from '@supernova-ai/snh-brand'
import type { ToolCallId } from '@supernova-ai/snh-llm'
import { Session, type SessionId } from '@supernova-ai/snh-session'
import AgentRegistry from '@supernova-ai/snh-agent'
import type { Agent } from '@supernova-ai/snh-agent'
import SystemPrompt from '@supernova-ai/snh-system-prompt'
import ToolRuntime from '@supernova-ai/snh-tools'
import TerminalSessionService from '@supernova-ai/snh-terminal'
import SandboxProvider from '@supernova-ai/snh-sandbox'
import type { ConfinedArgv, SandboxPolicy } from '@supernova-ai/snh-sandbox'
import SandboxPolicyService from '@supernova-ai/snh-sandbox-policy'
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import LocalSubprocessRuntime from '@supernova-ai/snh-subprocess-local'
import * as TerminalLocal from '@supernova-ai/snh-terminal-bash'
import * as ToolPty from '@supernova-ai/snh-tool-terminal'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

class PassthroughSandbox extends SandboxProvider {
  async confine(argv: readonly string[], _policy: SandboxPolicy): Promise<ConfinedArgv> {
    return { argv: [...argv], enforcement: 'full', denialSignatures: [], runnerFailureRules: [] }
  }
}

async function agent(ctx: Context): Promise<Agent> {
  const scope = ctx.plugin(() => {})
  const id = brandString<SessionId>('pty-loader-agent')
  const session = Session.create(id)
  const value: Agent = {
    id, options: {}, session, model: unsupportedModel(),
    inbox: unsupportedInbox(),
    status: 'idle',
    ctx: scope.ctx,
    send: () => {},
    followup: () => {}, steer: () => {}, inject: () => {}, cancel() {},
    runMaintenance: job => job(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
  await ctx.agents.register(value)
  return value
}

function resultText(result: { content: { type: string; text?: string }[] }): string {
  return result.content.filter(block => block.type === 'text').map(block => block.text).join('')
}

const suite = process.platform === 'linux' || process.platform === 'darwin' ? describe : describe.skip

suite('terminal real Loader composition through cordis.yml', () => {
  it('boots cordis.yml and preserves shell state across real tool calls', async () => {
    root = await mkdtemp(join(tmpdir(), 'snh-pty-loader-'))
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, [
      "- name: '@supernova-ai/snh-agent'",
      "- name: '@supernova-ai/snh-system-prompt'",
      "- name: '@supernova-ai/snh-tools'",
      "- name: '@supernova-ai/snh-tool-executor-native'",
      "- name: '@supernova-ai/snh-terminal'",
      "- name: '@supernova-ai/snh-test-sandbox'",
      "- name: '@supernova-ai/snh-session-projection'",
      "- name: '@supernova-ai/snh-sandbox-policy'",
      '  config:',
      '    mode: danger-full-access',
      `    workspaceRoot: ${JSON.stringify(root)}`,
      "- name: '@supernova-ai/snh-subprocess-local'",
      "- name: '@supernova-ai/snh-terminal-bash'",
      '  config:',
      '    pollIntervalMs: 10',
      '    exactProbeAfterMs: 20',
      '    idleSilenceMs: 250',
      '    handoffGraceMs: 250',
      '    timeoutMs: 2000',
      '    disposeGraceMs: 500',
      "- name: '@supernova-ai/snh-tool-terminal'",
      '',
    ].join('\n'))

    context = new Context()

    provideWorkingDirectoryFixture(context)
    context.baseUrl = pathToFileURL(root).href + '/'
    await context.plugin(Loader)
    context.loader.builtins.include = Include
    const modules = new Map<string, unknown>([
      ['@supernova-ai/snh-agent', AgentRegistry],
      ['@supernova-ai/snh-system-prompt', SystemPrompt],
      ['@supernova-ai/snh-tools', ToolRuntime],
      ['@supernova-ai/snh-tool-executor-native', NativeToolExecutor],
      ['@supernova-ai/snh-terminal', TerminalSessionService],
      ['@supernova-ai/snh-test-sandbox', PassthroughSandbox],
      ['@supernova-ai/snh-session-projection', SessionProjectionRegistry],
      ['@supernova-ai/snh-sandbox-policy', SandboxPolicyService],
      ['@supernova-ai/snh-subprocess-local', LocalSubprocessRuntime],
      ['@supernova-ai/snh-terminal-bash', TerminalLocal],
      ['@supernova-ai/snh-tool-terminal', ToolPty],
    ])
    context.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
        return modules.get(specifier)
      },
    } as unknown as NonNullable<typeof context.loader.internal>
    await context.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
    await context.loader.await()

    const owner = await agent(context)
    const signal = new AbortController().signal
    const spawn = await executeToolFixture(context, {
      signal, callId: brandString<ToolCallId>('spawn'), name: 'terminal_open', arguments: { type: 'shell', name: 'main', cwd: root }, agent: owner,
    })
    expect(resultText(spawn)).toContain('started terminal session pty-1 (main)')

    await executeToolFixture(context, {
      signal, callId: brandString<ToolCallId>('state'), name: 'terminal_send', arguments: { sessionId: 'pty-1', text: 'export KEEP=loader; cd /' }, agent: owner,
    })
    const read = await executeToolFixture(context, {
      signal, callId: brandString<ToolCallId>('read'), name: 'terminal_send', arguments: { sessionId: 'pty-1', text: 'printf "cwd=%s keep=%s\\n" "$PWD" "$KEEP"' }, agent: owner,
    })
    expect(resultText(read)).toContain('cwd=/ keep=loader')
    expect(context.terminals.list(owner)).toHaveLength(1)
  }, 15_000)
})
