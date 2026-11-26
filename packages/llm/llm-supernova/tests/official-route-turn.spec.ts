/** Turns on the official endpoint report credential failures on the model request, after the prompt is recorded. */
import { afterEach, expect, it, vi } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import LlmRuntime, { createUserMessage } from '@supernova-ai/snh-llm'
import AgentRegistry from '@supernova-ai/snh-agent'
import AgentLoop from '@supernova-ai/snh-agent-loop'
import SessionStore, { type SessionId } from '@supernova-ai/snh-session'
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import SystemPrompt from '@supernova-ai/snh-system-prompt'
import ToolRuntime from '@supernova-ai/snh-tools'
import * as NativeToolExecutor from '@supernova-ai/snh-tool-executor-native'
import * as SuperNova from '@supernova-ai/snh-llm-supernova-api-key'
import SuperNovaAuth from '@supernova-ai/snh-supernova-auth'
import { brandString } from '@supernova-ai/snh-brand'

const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

it('records the prompt and fails the request when the official endpoint has a malformed key', async () => {
  vi.stubEnv('DEEPSEEK_API_KEY', 'invalid\nheader')
  const fetch = vi.spyOn(globalThis, 'fetch')
  const ctx = new Context()
  contexts.push(ctx)
  for (const plugin of [LlmRuntime, SessionStore, SessionProjectionRegistry, SystemPrompt, ToolRuntime, AgentRegistry]) {
    await ctx.plugin(plugin)
  }
  await ctx.plugin(NativeToolExecutor)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SuperNovaAuth)
  await ctx.plugin(SuperNova, {})
  const agent = await ctx.agentLoop.create(brandString<SessionId>('malformed-official-key'), { provider: 'deepseek-official', model: 'deepseek-flash' })
  agent.followup(createUserMessage({ content: [{ type: 'text', text: 'hello' }], source: { kind: 'user' } }))
  await agent.whenIdle()
  const events = agent.session.snapshotEvents()
  expect(events.map(event => event.type)).toContain('user/message')
  expect(events.find(event => event.type === 'assistant/attempt')?.data).toMatchObject({
    stream: [{ chunk: { type: 'finish', reason: { kind: 'error', failure: { code: 'INVALID_CREDENTIAL' } } } }],
  })
  expect(fetch).not.toHaveBeenCalled()
})
