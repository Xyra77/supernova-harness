import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import Loader from '@supernova-ai/cordis-plugin-loader'
import Include from '@supernova-ai/cordis-plugin-include'
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import AgentRegistry from '@supernova-ai/snh-agent'
import type { Agent, AgentStatus } from '@supernova-ai/snh-agent'
import CommandRuntime from '@supernova-ai/snh-commands'
import SessionStore, { type SessionId } from '@supernova-ai/snh-session'
import * as CommandFeedback from '@supernova-ai/snh-command-feedback'
import { getOrCreateAnonymousUserId } from '@supernova-ai/snh-anonymous-user-id'
import { unsupportedModel, unsupportedInbox } from '@supernova-ai/snh-agent-loop-testkit'
import { brandString } from '@supernova-ai/snh-brand'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
  vi.unstubAllEnvs()
})

/** Register one idle agent over a store-owned session, as an app's spine does. */
async function agent(ctx: Context): Promise<Agent> {
  const scope = ctx.plugin(() => {})
  const id = brandString<SessionId>('feedback-loader-agent')
  const session = ctx.sessions.create(id)
  let status: AgentStatus = 'idle'
  const value: Agent = {
    id,
    options: {},
    session,
    model: unsupportedModel(),
    inbox: unsupportedInbox(),
    ctx: scope.ctx,
    get status() { return status },
    send: () => {},
    followup: () => {},
    steer: () => {},
    inject: () => {},
    cancel() { status = 'idle' },
    runMaintenance: task => task(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
  await ctx.agents.register(value)
  return value
}

describe('/feedback real Loader composition through cordis.yml', () => {
  it('boots cordis.yml and records feedback without model-visible output', async () => {
    root = await mkdtemp(join(tmpdir(), 'snh-command-feedback-loader-'))
    vi.stubEnv('SNH_HOME', root)
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, [
      "- name: '@supernova-ai/snh-session-projection'",
      "- name: '@supernova-ai/snh-agent'",
      "- name: '@supernova-ai/snh-session-projection'",
      "- name: '@supernova-ai/snh-session'",
      "- name: '@supernova-ai/snh-commands'",
      "- name: '@supernova-ai/snh-command-feedback'",
      '',
    ].join('\n'))

    context = new Context()
    context.baseUrl = pathToFileURL(root).href + '/'
    await context.plugin(Loader)
    context.loader.builtins.include = Include
    const modules = new Map<string, unknown>([
      ['@supernova-ai/snh-session-projection', SessionProjectionRegistry],
      ['@supernova-ai/snh-agent', AgentRegistry],
      ['@supernova-ai/snh-session-projection', SessionProjectionRegistry],
      ['@supernova-ai/snh-session', SessionStore],
      ['@supernova-ai/snh-commands', CommandRuntime],
      ['@supernova-ai/snh-command-feedback', CommandFeedback],
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

    // Discoverable through the composed registry, as a UI adapter finds it.
    expect(context.commands.list(owner).map(command => command.name)).toContain('feedback')

    const accepted = await context.commands.execute(owner, '/feedback the diff view is unreadable', [], signal)
    const userId = getOrCreateAnonymousUserId({ env: { SNH_HOME: root } })
    expect(accepted?.result).toEqual({
      kind: 'success',
      text: `Feedback recorded for session feedback-loader-agent\nAnonymous user: ${userId}.`,
    })
    const rejected = await context.commands.execute(owner, '/feedback', [], signal)
    expect(rejected?.result).toEqual({
      kind: 'error',
      text: 'Feedback text is required. Usage: /feedback <text>',
    })

    // The domain event owns the payload; generic command bookkeeping omits it.
    expect(owner.session.snapshotEvents().map(event => event.type))
      .toEqual(['command/run', 'feedback/record', 'command/done', 'command/run', 'command/done'])
    const run = owner.session.snapshotEvents().find(event => event.type === 'command/run')
    expect(run?.type === 'command/run' && Object.hasOwn(run.data, 'args')).toBe(false)
    const feedback = owner.session.snapshotEvents().find(event => event.type === 'feedback/record')
    expect(feedback?.type === 'feedback/record' && feedback.data.text).toBe('the diff view is unreadable')
    expect(JSON.stringify(owner.session.snapshotEvents()).match(/the diff view is unreadable/gu)).toHaveLength(1)

    // Nothing reached the model.
    expect(owner.session.deriveMessages()).toEqual([])
    expect(owner.session.surface.nodes).toEqual([])
  })
})
