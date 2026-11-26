/** Real Loader composition: the bridge mounted from a cordis.yml row beside the shipped core plugins. */

import * as NativeToolExecutor from '@supernova-ai/snh-tool-executor-native'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, expect, it, vi } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import Loader from '@supernova-ai/cordis-plugin-loader'
import Include from '@supernova-ai/cordis-plugin-include'
import AgentRegistry from '@supernova-ai/snh-agent'
import AgentLoop from '@supernova-ai/snh-agent-loop'
import CommandRuntime from '@supernova-ai/snh-commands'
import LocalFileSystem from '@supernova-ai/snh-fs-local'
import WorkingDirectory from '@supernova-ai/snh-working-directory'
import LlmRuntime, { createUserMessage } from '@supernova-ai/snh-llm'
import SessionStore, { type SessionId } from '@supernova-ai/snh-session'
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import SystemPrompt from '@supernova-ai/snh-system-prompt'
import ToolRuntime from '@supernova-ai/snh-tools'
import { defineContentToolFixture } from '@supernova-ai/snh-tool-testkit'
import * as ClaudeCodeMods from '../src/index.ts'
import { MockAdapter, textResponse, toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { brandString } from '@supernova-ai/snh-brand'

// Keep workspace imports in Vitest's source graph even when the config has a package scope.
vi.mock('@supernova-ai/cordis-plugin-loader/src/resolve.ts', () => ({ createResolve: () => undefined }))

const FIXTURES = resolve(import.meta.dirname, 'fixtures')

let ctx: Context | undefined
let root: string | undefined

afterEach(async () => {
  await ctx?.fiber.dispose()
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  ctx = undefined
  root = undefined
})

it('loads from cordis.yml, counts the model\'s tool calls, and answers /tally through the composed command registry', async () => {
  root = await mkdtemp(join(tmpdir(), 'snh-cc-mods-composition-'))
  await writeFile(join(root, 'package.json'), JSON.stringify({ type: 'module' }))
  const configPath = join(root, 'cordis.yml')
  const modules = new Map<string, unknown>([
    ['@supernova-ai/snh-llm', LlmRuntime],
    ['@supernova-ai/snh-session', SessionStore],
    ['@supernova-ai/snh-session-projection', SessionProjectionRegistry],

    ['@supernova-ai/snh-system-prompt', SystemPrompt],
    ['@supernova-ai/snh-fs-local', LocalFileSystem],
    ['@supernova-ai/snh-working-directory', WorkingDirectory],
    ['@supernova-ai/snh-tools', ToolRuntime],
    ['@supernova-ai/snh-tool-executor-native', NativeToolExecutor],
    ['@supernova-ai/snh-agent', AgentRegistry],
    ['@supernova-ai/snh-agent-loop', AgentLoop],
    ['@supernova-ai/snh-commands', CommandRuntime],
    ['@supernova-ai/snh-experimental-claude-code-mods', ClaudeCodeMods],
  ])
  // A mod is a plugin like any other: here the tutorial mod's `defineMod` wrapper, mounted by file URL after the bridge.
  const firstMod = pathToFileURL(resolve(FIXTURES, 'first-mod.ts')).href
  await writeFile(configPath, [
    ...[...modules.keys()].map(name => `- name: '${name}'`),
    `- name: '${firstMod}'`,
    '  config:',
    '    greeting: The model made',
  ].join('\n') + '\n')

  const context = ctx = new Context()
  context.baseUrl = pathToFileURL(root).href + '/'
  await context.plugin(Loader)
  context.loader.builtins.include = Include
  context.loader.internal = undefined
  await context.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
  await context.loader.await()
  for (const entry of context.loader.entries()) await entry.fiber?.await()

  const adapter = new MockAdapter([toolCallResponse('c1', 'echo', { command: 'ls' }), textResponse('listed')])
  context.llm.registerAdapter(['mock'], adapter)
  context.tools.register(defineContentToolFixture({
    name: 'echo', description: 'echo', parameters: { command: { type: 'string' } },
    async execute(args) { return [{ type: 'text', text: `ran ${args.command}` }] },
  }))
  const agent = await context.agentLoop.create(brandString<SessionId>('composed'), { provider: 'mock', model: 'mock' })
  expect(context.commands.list(agent).map(command => command.name)).toEqual(['tally'])
  agent.followup(createUserMessage({ content: [{ type: 'text', text: 'list the files here' }], source: { kind: 'user' } }))
  await agent.whenIdle()
  expect(adapter.requests).toHaveLength(2)
  const run = await context.commands.execute(agent, '/tally', [], new AbortController().signal)
  expect(run?.result).toEqual({ kind: 'success', text: 'first-mod: The model made 1 tool calls since this mod loaded' })
})
