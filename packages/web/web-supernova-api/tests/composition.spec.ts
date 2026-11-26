/**
 * Real Loader composition: the SuperNova model routes, the web seam, and this plugin boot from a `cordis.yml`, so the
 * API-key and account endpoints and the key come from the route entries the Loader activated. Only the network and the account service
 * are stubbed.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Context } from '@supernova-ai/cordis'
import type { ModuleLoaderV2 } from '@supernova-ai/cordis-plugin-loader'
import { boot } from '@supernova-ai/snh-app-boot'
import { createLaunchEnvironmentSnapshot } from '@supernova-ai/snh-launch-environment'
import LlmRuntime from '@supernova-ai/snh-llm'
import * as Account from '@supernova-ai/snh-llm-deepseek-account'
import * as Official from '@supernova-ai/snh-llm-supernova-api-key'
import SuperNovaAuth from '@supernova-ai/snh-supernova-auth'
import WebRuntime from '@supernova-ai/snh-web'
import * as webApiPlugin from '@supernova-ai/snh-web-supernova-api'
import { accountStub } from '../../../account/deepseek-account/tests/account-stub.ts'

const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
  vi.unstubAllGlobals()
})

const MODULES = new Map<string, unknown>([
  ['@supernova-ai/snh-llm', LlmRuntime],
  ['@supernova-ai/snh-supernova-auth', SuperNovaAuth],
  ['@supernova-ai/snh-llm-supernova-api-key', Official],
  ['@supernova-ai/snh-llm-deepseek-account', Account],
  ['@supernova-ai/snh-web', WebRuntime],
  ['@supernova-ai/snh-web-supernova-api', webApiPlugin],
])

/** One dispatched Search or Fetch API request. */
interface Sent {
  endpoint: string
  authorization: string | null
  token: string | null
}

/**
 * Boot the composition with a fixed launch environment and a stubbed network.
 * @param web - web-supernova-api config.
 * @param environment - launch-environment variables.
 * @param account - the sign-out signal of the stubbed account and the answer to Search requests, when not the default.
 * @returns the booted root context and the Search and Fetch API requests sent so far.
 */
async function bootComposition(
  web: Record<string, unknown>, environment: Record<string, string>,
  account: { signedOut?: AbortSignal; search?: (signal: AbortSignal) => Promise<Response> } = {},
) {
  // The providers and model listings dispatch to a string endpoint.
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith('/models')) return Response.json({ object: 'list', data: [] })
    if (url.endsWith('/search') && account.search !== undefined) return await account.search(init!.signal!)
    return Response.json(url.endsWith('/search') ? { results: [] } : { content: '# Page' })
  })
  vi.stubGlobal('fetch', fetchMock)
  const root = await mkdtemp(join(tmpdir(), 'snh-web-supernova-api-composition-'))
  cleanups.push(async () => { await rm(root, { recursive: true, force: true }) })
  const previousHome = process.env.SNH_HOME
  process.env.SNH_HOME = root
  cleanups.push(async () => {
    if (previousHome === undefined) Reflect.deleteProperty(process.env, 'SNH_HOME')
    else process.env.SNH_HOME = previousHome
  })
  const configPath = join(root, 'cordis.yml')
  await writeFile(configPath, JSON.stringify([
    { id: 'llm', name: '@supernova-ai/snh-llm' },
    { id: 'supernova-auth', name: '@supernova-ai/snh-supernova-auth' },
    { id: 'llm-supernova', name: '@supernova-ai/snh-llm-supernova-api-key' },
    { id: 'llm-deepseek-account', name: '@supernova-ai/snh-llm-deepseek-account' },
    { id: 'web', name: '@supernova-ai/snh-web', config: { searchProvider: 'supernova-search-api', fetchProvider: 'supernova-fetch-api' } },
    { id: 'web-supernova-api', name: '@supernova-ai/snh-web-supernova-api', config: web },
  ]))
  const ctx: Context = await boot('web-supernova-api-composition', configPath, [], (host) => {
    const modules: ModuleLoaderV2 = {
      version: 'v2', loadCache: new Map(),
      async import(specifier) {
        if (!MODULES.has(specifier)) throw new Error(`Unexpected fixture module ${specifier}`)
        return MODULES.get(specifier)
      },
      register(): never { throw new Error('Unexpected module hook registration') },
      getOrCreateModuleJob(): never { throw new Error('Unexpected module job creation') },
      resolveSync(): never { throw new Error('Unexpected synchronous module resolution') },
      load(): never { throw new Error('Unexpected module load') },
    }
    host.loader.internal = modules
    host.provide('launchEnvironment', createLaunchEnvironmentSnapshot([{ source: 'process', values: environment }]))
    host.provide('supernovaAccount', accountStub({
      token: () => 'account-token', ...account.signedOut === undefined ? {} : { signedOut: account.signedOut },
    }))
  })
  cleanups.push(async () => { await ctx.fiber.dispose() })
  const sent = (): Sent[] => fetchMock.mock.calls.flatMap(([endpoint, init]) => {
    if (!endpoint.includes('/v1/tools/')) return []
    const headers = new Headers(init?.headers)
    return [{ endpoint, authorization: headers.get('authorization'), token: headers.get('x-snh-auth-token') }]
  })
  return { ctx, sent }
}

/** The active loader entry with `id`. */
function entry(ctx: Context, id: string) {
  const found = [...ctx.loader.entries()].find(row => row.options.id === id)
  if (found?.fiber === undefined) throw new Error(`expected loader entry ${id}`)
  return found.fiber
}

describe('web-supernova-api over the real model routes', () => {
  it('serves a user with only DEEPSEEK_API_KEY by default, at the origin DEEPSEEK_BASE_URL names', async () => {
    const { ctx, sent } = await bootComposition({}, {
      DEEPSEEK_API_KEY: 'chat-key', DEEPSEEK_BASE_URL: 'https://internal.deepseek.test/anthropic',
    })
    expect([await ctx.web.searchReady(undefined), await ctx.web.fetchReady(undefined)]).toEqual([true, true])
    await ctx.web.search({ query: 'q' })
    await ctx.web.fetch({ url: 'https://example.test/' })
    expect(sent()).toEqual([
      { endpoint: 'https://internal.deepseek.test/v1/tools/search', authorization: 'Bearer chat-key', token: null },
      { endpoint: 'https://internal.deepseek.test/v1/tools/fetch', authorization: 'Bearer chat-key', token: null },
    ])
  })

  it('sends Fetch to its own YAML endpoint while Search follows the route', async () => {
    const { ctx, sent } = await bootComposition(
      { fetchBaseURL: 'https://own.deepseek.test/v1/tools', fetchApiKeyEnv: 'OWN_FETCH_KEY' },
      { DEEPSEEK_API_KEY: 'chat-key', OWN_FETCH_KEY: 'own-key', DEEPSEEK_BASE_URL: 'https://internal.deepseek.test/anthropic' },
    )
    await ctx.web.search({ query: 'q' })
    await ctx.web.fetch({ url: 'https://example.test/' })
    expect(sent()).toEqual([
      { endpoint: 'https://internal.deepseek.test/v1/tools/search', authorization: 'Bearer chat-key', token: null },
      { endpoint: 'https://own.deepseek.test/v1/tools/fetch', authorization: 'Bearer own-key', token: null },
    ])
  })

  it('falls back to the signed-in account at the account route origin without a key, outside a SuperNova conversation', async () => {
    const { ctx, sent } = await bootComposition({}, { DEEPSEEK_BASE_URL: 'https://internal.deepseek.test/anthropic' })
    expect([await ctx.web.searchReady('moonshotai'), await ctx.web.fetchReady(undefined)]).toEqual([true, true])
    await ctx.web.search({ query: 'q' })
    expect(sent()).toEqual([{ endpoint: 'https://internal.deepseek.test/v1/tools/search', authorization: null, token: 'account-token' }])
  })

  it('bills each capability as its billing setting chooses', async () => {
    const { ctx, sent } = await bootComposition({ searchBilling: 'account', fetchBilling: 'api-key' }, {
      DEEPSEEK_API_KEY: 'chat-key', DEEPSEEK_BASE_URL: 'https://internal.deepseek.test/anthropic',
    })
    await ctx.web.search({ query: 'q' })
    await ctx.web.fetch({ url: 'https://example.test/' })
    expect(sent()).toEqual([
      { endpoint: 'https://internal.deepseek.test/v1/tools/search', authorization: null, token: 'account-token' },
      { endpoint: 'https://internal.deepseek.test/v1/tools/fetch', authorization: 'Bearer chat-key', token: null },
    ])
  })

  it('ends an account-billed search in flight when the account signs out, with sign-in guidance', async () => {
    const signedOut = new AbortController()
    const sent = Promise.withResolvers<AbortSignal>()
    const { ctx } = await bootComposition({ searchBilling: 'account' }, { DEEPSEEK_API_KEY: 'chat-key' }, {
      signedOut: signedOut.signal,
      search: (signal) => {
        sent.resolve(signal)
        return new Promise<Response>((_resolve, reject) => {
          signal.addEventListener('abort', () => { reject(signal.reason as Error) }, { once: true })
        })
      },
    })
    const search = ctx.web.search({ query: 'q' })
    const request = await sent.promise
    expect(request.aborted).toBe(false)
    signedOut.abort()
    await expect(search).rejects.toMatchObject({
      code: 'WEB_PROVIDER_ERROR',
      message: 'The SuperNova account signed out before this web request finished. Guide the user to sign in to SuperNova again;'
        + ' the endpoint does not need changing.',
    })
    expect(request.aborted).toBe(true)
  })

  it('withholds API-key billing without a key despite a sign-in', async () => {
    const { ctx, sent } = await bootComposition({ searchBilling: 'api-key' }, {})
    expect(await ctx.web.searchReady('deepseek-account')).toBe(false)
    await expect(ctx.web.search({ query: 'q' })).rejects.toMatchObject({ code: 'WEB_PROVIDER_CREDENTIAL_MISSING' })
    expect(sent()).toEqual([])
  })

  it('sends DEEPSEEK_API_KEY to the official base once the route entry is disposed, and unregisters with its own fiber', async () => {
    const { ctx, sent } = await bootComposition({}, {
      DEEPSEEK_API_KEY: 'chat-key', DEEPSEEK_BASE_URL: 'https://internal.deepseek.test/anthropic',
    })
    await entry(ctx, 'llm-supernova').dispose()
    expect(await ctx.web.searchReady(undefined)).toBe(true)
    await ctx.web.search({ query: 'q' })
    expect(sent()).toEqual([{ endpoint: 'https://api.deepseek.com/v1/tools/search', authorization: 'Bearer chat-key', token: null }])
    await entry(ctx, 'web-supernova-api').dispose()
    expect(ctx.web.listProviders()).toEqual({ search: [], fetch: [] })
  })
})
