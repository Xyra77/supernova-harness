/** Explicitly enabled billed Flash smoke through the actual native official provider. */
import type { ModuleLoaderV2 } from '@supernova-ai/cordis-plugin-loader'
import { boot } from '@supernova-ai/snh-app-boot'
import LlmRuntime from '@supernova-ai/snh-llm'
import SessionStore, { type SessionId } from '@supernova-ai/snh-session'
import * as JsonlPersistence from '@supernova-ai/snh-session-persistence-jsonl'
import * as Official from '@supernova-ai/snh-llm-supernova-api-key'
import SuperNovaAuth from '@supernova-ai/snh-supernova-auth'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import Translator from '../src/index.ts'
import { brandString } from '@supernova-ai/snh-brand'

const enabled = process.env.SNH_TRANSLATION_DEEPSEEK_LIVE === '1' && (process.env.DEEPSEEK_API_KEY?.length ?? 0) > 0

it.skipIf(!enabled)('translates a small independent billed query with exact Flash and thinking off', async () => {
  const root = await mkdtemp(join(tmpdir(), 'snh-paid-translation-live-'))
  const previousHome = process.env.SNH_HOME
  process.env.SNH_HOME = root
  let close: (() => Promise<void>) | undefined
  try {
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, JSON.stringify([
      { id: 'llm', name: '@supernova-ai/snh-llm' },
      { id: 'sessions', name: '@supernova-ai/snh-session' },
      { id: 'storage', name: '@supernova-ai/snh-session-persistence-jsonl', config: { root: join(root, 'sessions'), compression: 'none' } },
      { id: 'supernova-auth', name: '@supernova-ai/snh-supernova-auth' },
      { id: 'official-live-owner', name: '@supernova-ai/snh-llm-supernova-api-key' },
      { id: 'translator', name: '@supernova-ai/snh-experimental-translator', config: { supernovaMaxOutputTokens: 128 } },
    ]))
    const modules = new Map<string, unknown>([
      ['@supernova-ai/snh-llm', LlmRuntime], ['@supernova-ai/snh-session', SessionStore],
      ['@supernova-ai/snh-session-persistence-jsonl', JsonlPersistence],
      ['@supernova-ai/snh-supernova-auth', SuperNovaAuth],
      ['@supernova-ai/snh-llm-supernova-api-key', Official], ['@supernova-ai/snh-experimental-translator', Translator],
    ])
    const ctx = await boot('paid-translation-live', configPath, [], (host) => {
      const source: ModuleLoaderV2 = {
        version: 'v2', loadCache: new Map(),
        async import(specifier) {
          if (!modules.has(specifier)) throw new Error(`Unexpected live fixture import: ${specifier}`)
          return modules.get(specifier)
        },
        register(): never { throw new Error('Unexpected module hook registration') },
        getOrCreateModuleJob(): never { throw new Error('Unexpected module job creation') },
        resolveSync(): never { throw new Error('Unexpected synchronous module resolution') },
        load(): never { throw new Error('Unexpected module load') },
      }
      host.loader.internal = source
    })
    close = async () => { await ctx.fiber.dispose() }
    const session = ctx.sessions.create(brandString<SessionId>('paid-live-translation'), { meta: { cwd: root } })
    await using _writer = await ctx.sessionPersistence.create(session.header)
    expect(await ctx.translator.availableProviders()).toContain('deepseek-official')
    const result = await ctx.translator.translate(ctx.translator.resolve({ provider: 'deepseek-official', text: 'Hello world.',
      targetLanguage: 'zh', sourceLanguage: 'en', sessionId: session.id }))
    expect(result).toContain('世界')
    expect(session.deriveMessages()).toEqual([])
    await using reader = await ctx.sessionPersistence.open(session.id, 'read')
    const events = (await reader.read()).events
    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({ type: 'plugin:translator/request', ignorable: true,
      data: { provider: 'deepseek-official', metadata: { modelRequest: { config: {
        provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'off', maxTokens: 128,
      } } } },
    })
    expect(events[1]).toMatchObject({ type: 'plugin:translator/result', ignorable: true, data: { requestSeq: 0, text: result } })
  } finally {
    await close?.()
    if (previousHome === undefined) Reflect.deleteProperty(process.env, 'SNH_HOME')
    else process.env.SNH_HOME = previousHome
    await rm(root, { recursive: true, force: true })
  }
})
