import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import Loader from '@supernova-ai/cordis-plugin-loader'
import Include from '@supernova-ai/cordis-plugin-include'
import type { Agent } from '@supernova-ai/snh-agent'
import CommandRuntime from '@supernova-ai/snh-commands'
import SessionStore, { type SessionId } from '@supernova-ai/snh-session'
import * as SessionLogDownload from '@supernova-ai/snh-session-log-export'
import { brandString } from '@supernova-ai/snh-brand'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

describe('session-log-download real Loader composition', () => {
  it('discovers and executes /export through the assembled command plane', async () => {
    root = await mkdtemp(join(tmpdir(), 'snh-session-export-loader-'))
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, [
      "- name: '@supernova-ai/snh-session'",
      "- name: '@supernova-ai/snh-commands'",
      "- name: '@supernova-ai/snh-session-log-export'",
      '',
    ].join('\n'))

    context = new Context()
    context.baseUrl = pathToFileURL(root).href + '/'
    context.provide('connection', {
      fetch: { register: () => () => Promise.resolve() },
    } as never)
    await context.plugin(Loader)
    context.loader.builtins.include = Include
    const modules = new Map<string, unknown>([
      ['@supernova-ai/snh-session', SessionStore],
      ['@supernova-ai/snh-commands', CommandRuntime],
      ['@supernova-ai/snh-session-log-export', SessionLogDownload],
    ])
    context.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
        return modules.get(specifier)
      },
    } as unknown as NonNullable<typeof context.loader.internal>
    await context.loader.create({
      name: 'cordis:include',
      config: { path: pathToFileURL(configPath).href },
    })
    await context.loader.await()

    const session = (context.get('sessions') as SessionStore)
      .create(brandString<SessionId>('loader-session-export'), { meta: { createdAt: 1 } })
    const agent = { session, status: 'idle', options: {} } as unknown as Agent
    expect(context.commands.list(agent)).toContainEqual({
      definitionId: '@supernova-ai/snh-session-log-export',
      name: 'export', description: 'Download this Session log as a ZIP archive',
    })
    const execution = await context.commands.execute(agent, '/export', [], new AbortController().signal)
    expect(execution?.result).toEqual({ kind: 'success', text: 'Session log download requested.' })
    expect(session.snapshotEvents().map(event => event.type)).toEqual(['command/run', 'command/done'])
    expect(session.deriveMessages()).toEqual([])
  })
})
