/**
 * Real Loader composition of the account service, the account route, and the Agent loop against a loopback SuperNova
 * stand-in: a sign-out ends the requests that carry its token, whether or not their route is still mounted.
 */
import { once } from 'node:events'
import { createServer } from 'node:http'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, expect, it, vi } from 'vitest'
import * as NativeToolExecutor from '@supernova-ai/snh-tool-executor-native'
import { Context } from '@supernova-ai/cordis'
import Include from '@supernova-ai/cordis-plugin-include'
import Loader from '@supernova-ai/cordis-plugin-loader'
import AgentRegistry from '@supernova-ai/snh-agent'
import AgentLoop from '@supernova-ai/snh-agent-loop'
import AuthorizationService from '@supernova-ai/snh-authorization'
import { brandString } from '@supernova-ai/snh-brand'
import { credentialKey } from '@supernova-ai/snh-credentials'
import LocalCredentials from '@supernova-ai/snh-credentials-local'
import SuperNovaAccount, { type AccountClientMetadata } from '@supernova-ai/snh-deepseek-account'
import LlmRuntime, { type StreamChunk } from '@supernova-ai/snh-llm'
import * as AccountRoute from '@supernova-ai/snh-llm-deepseek-account'
import SuperNovaAuth from '@supernova-ai/snh-supernova-auth'
import SessionStore, { type SessionId } from '@supernova-ai/snh-session'
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import SystemPrompt from '@supernova-ai/snh-system-prompt'
import ToolRuntime from '@supernova-ai/snh-tools'
import { profileComposition } from '../../../settings/settings/tests/profile-composition.ts'
import { sourceModuleLoader, sse, start, user } from './helpers.ts'

const PROVIDER = 'deepseek-account'
const MODEL = 'deepseek-flash'
const CLIENT: AccountClientMetadata = { version: '1.2.3', locale: 'en', timezoneOffsetSeconds: 28_800 }
const SIGNED_OUT = { kind: 'aborted', reason: { kind: 'hook', reason: 'deepseek-account/signed-out' } }

const cleanup: Array<() => Promise<unknown>> = []
afterEach(async () => {
  while (cleanup.length) await cleanup.pop()!()
  vi.unstubAllEnvs()
})

/** One open Messages response of the stand-in. */
interface OpenResponse {
  /** Text deltas written so far. */
  deltas: number
  /** Settles when the client closes the response. */
  closed: Promise<undefined>
}

/** Loopback SuperNova stand-in: the account listing, the logout call, and Messages responses that stream until closed. */
async function upstream() {
  const responses: OpenResponse[] = []
  const http = createServer((request, response) => {
    request.resume()
    request.once('end', () => {
      if (request.method === 'GET' && request.url === '/models') {
        response.setHeader('content-type', 'application/json')
        response.end(JSON.stringify({ data: [{
          id: MODEL, name: 'DeepSeek-V4.1-Flash', context_window: 1_048_576, max_output_tokens: 100_000,
          input_modalities: ['text'], output_modalities: ['text'], api_capabilities: { anthropic_messages: {} },
        }] }))
        return
      }
      if (request.url === '/auth-api/v0/users/logout') {
        response.setHeader('content-type', 'application/json')
        response.end(JSON.stringify({ code: 0, data: { biz_code: 0, biz_data: null } }))
        return
      }
      if (request.url !== '/anthropic/v1/messages') { response.writeHead(404).end('{}'); return }
      const closed = Promise.withResolvers<undefined>()
      const open: OpenResponse = { deltas: 0, closed: closed.promise }
      responses.push(open)
      response.writeHead(200, { 'content-type': 'text/event-stream' })
      response.write(sse([start, { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }]))
      const timer = setInterval(() => {
        response.write(sse([{ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'x' } }]))
        open.deltas += 1
      }, 10)
      response.once('close', () => { clearInterval(timer); closed.resolve(undefined) })
    })
  })
  http.listen(0, '127.0.0.1')
  await once(http, 'listening')
  const address = http.address()
  if (address === null || typeof address === 'string') throw new Error('missing loopback port')
  cleanup.push(async () => {
    http.closeAllConnections()
    await new Promise<void>((resolve) => { http.close(() => { resolve() }) })
  })
  /** The first Messages response once it has streamed `count` more deltas. */
  const streaming = async (count: number): Promise<OpenResponse> => {
    const from = responses[0]?.deltas ?? 0
    await vi.waitFor(() => { expect(responses[0]?.deltas).toBeGreaterThanOrEqual(from + count) }, { timeout: 10_000, interval: 5 })
    return responses[0]!
  }
  return { origin: `http://127.0.0.1:${String(address.port)}`, streaming }
}

/** Boot the profile through the Loader with a signed-in account whose inference origin is the stand-in. */
async function boot(origin: string) {
  const home = await mkdtemp(join(tmpdir(), 'snh-account-signout-'))
  cleanup.push(() => rm(home, { recursive: true, force: true }))
  vi.stubEnv('SNH_HOME', home)
  vi.stubEnv('DEEPSEEK_BASE_URL', '')
  const ctx = new Context()
  cleanup.push(() => ctx.fiber.dispose())
  const modules = new Map<string, { module: unknown; config?: object }>([
    ['@supernova-ai/snh-llm', { module: LlmRuntime }], ['@supernova-ai/snh-session', { module: SessionStore }],
    ['@supernova-ai/snh-session-projection', { module: SessionProjectionRegistry }], ['@supernova-ai/snh-system-prompt', { module: SystemPrompt }],
    ['@supernova-ai/snh-tools', { module: ToolRuntime }], ['@supernova-ai/snh-tool-executor-native', { module: NativeToolExecutor }],
    ['@supernova-ai/snh-agent', { module: AgentRegistry }], ['@supernova-ai/snh-agent-loop', { module: AgentLoop, config: { agents: [] } }],
    ['@supernova-ai/snh-credentials-local', { module: LocalCredentials, config: { path: join(home, '.credentials.yaml'), watch: false } }],
    ['@supernova-ai/snh-authorization', { module: AuthorizationService }],
    ['@supernova-ai/snh-deepseek-account', { module: SuperNovaAccount, config: {
      platformOrigin: origin, inferenceOrigin: origin, allowLoopbackHttp: true, logoutRetryDelayMs: 1,
    } }],
    ['@supernova-ai/snh-supernova-auth', { module: SuperNovaAuth }],
    ['@supernova-ai/snh-llm-deepseek-account', { module: AccountRoute, config: { baseURL: `${origin}/anthropic` } }],
  ])
  await writeFile(join(home, 'cordis.yml'), JSON.stringify(
    [...modules].map(([name, { config }]) => ({ name, ...config === undefined ? {} : { config } })),
  ))
  // The importer supplies source modules while Loader still owns configuration and effects.
  for (const name of modules.keys()) {
    const directory = join(home, 'node_modules', name)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'package.json'), JSON.stringify({ name, version: '0.1.3-alpha.1', type: 'module' }))
  }
  ctx.baseUrl = pathToFileURL(home).href + '/'
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  ctx.loader.internal = sourceModuleLoader(async (name) => {
    const found = modules.get(name)
    if (found === undefined) throw new Error(`unexpected module ${name}`)
    return found.module
  })
  const patchPath = await profileComposition(ctx, home, join(home, 'cordis.yml'))
  await ctx.credentials.modifyRecord(credentialKey('deepseek-account-platform', 'default'), () => Promise.resolve({
    kind: 'grant', payload: { version: 1, issuer: origin, token: 'test-platform-grant' },
  }))
  /** Switch the account route off through the profile patch, as the plugin switch does. */
  const disableRoute = async (): Promise<void> => {
    await writeFile(patchPath, '- id: llm-deepseek-account\n  disabled: true\n')
    await ctx.hmr.runExclusive(() => ctx.hmr.reconcileProfile())
  }
  return { ctx, disableRoute }
}

const routeListed = (ctx: Context): boolean => ctx.llm.listProviders().some(provider => provider.id === PROVIDER)

it.each([
  { route: 'mounted', disable: false },
  { route: 'disabled', disable: true },
])('ends a streaming account turn at sign-out with the signed-out cause while its route is $route', async ({ disable }) => {
  const http = await upstream()
  const { ctx, disableRoute } = await boot(http.origin)
  const agent = await ctx.agentLoop.create(brandString<SessionId>(`signout-${String(disable)}`), { provider: PROVIDER, model: MODEL })
  agent.followup(user())
  await http.streaming(2)
  if (disable) {
    // Disabling returns while the turn runs, and neither stops the turn nor closes its response.
    await disableRoute()
    expect(routeListed(ctx)).toBe(false)
    await http.streaming(2)
    expect(agent.status).toBe('running')
  }
  const response = await http.streaming(0)
  await ctx.supernovaAccount.signOut(CLIENT)
  await agent.whenIdle()
  await response.closed
  const end = agent.session.snapshotEvents().at(-1)
  expect({ type: end?.type, reason: (end?.data as { reason?: unknown }).reason }).toEqual({ type: 'turn/end', reason: SIGNED_OUT })
})

it('ends an account model request outside an Agent turn at sign-out, as a sign-in failure', async () => {
  const http = await upstream()
  const { ctx } = await boot(http.origin)
  const chunks: StreamChunk[] = []
  const consumed = (async () => {
    for await (const chunk of ctx.llm.stream({ provider: PROVIDER, model: MODEL, messages: [user()] })) chunks.push(chunk)
  })()
  const response = await http.streaming(2)
  await ctx.supernovaAccount.signOut(CLIENT)
  await consumed
  await response.closed
  expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'error', failure: {
    code: 'ACCOUNT_SIGN_IN_REQUIRED',
    message: 'The SuperNova account signed out before this request finished. Sign in to SuperNova to use the account provider.',
  } } })
})
