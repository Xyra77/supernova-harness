import AgentRegistry from '@supernova-ai/snh-agent'
import { createUserMessage } from '@supernova-ai/snh-llm'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import LlmRuntime from '@supernova-ai/snh-llm'
import * as LlmSuperNova from '@supernova-ai/snh-llm-supernova-api-key'
import SuperNovaAuth from '@supernova-ai/snh-supernova-auth'
import SessionStore, { type SessionId } from '@supernova-ai/snh-session'
import SessionTitleService from '@supernova-ai/snh-session-title'
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import * as FirstMessageTitleProvider from '@supernova-ai/snh-session-title-first-prompt-llm'
import { brandString } from '@supernova-ai/snh-brand'

const contexts: Context[] = []

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

describe.skipIf(!process.env.DEEPSEEK_API_KEY)('first-prompt title provider with real SuperNova API', () => {
  it('replaces the fallback with a short model title', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SuperNovaAuth)
    await ctx.plugin(LlmSuperNova, { thinking: 'disabled' })
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(SessionTitleService, {
      fallbackMaxWords: 5,
      fallbackMaxBytes: 40,
      maxTitleBytes: 80,
    })
    await ctx.plugin(FirstMessageTitleProvider, {
      targetWords: 5,
      targetCjkCharacters: 10,
      maxInputBytes: 4_096,
      maxOutputTokens: 64,
      timeoutMs: 60_000,
      provider: 'deepseek-official',
      model: 'deepseek-v4-flash',
    })
    const session = ctx.sessions.create(brandString<SessionId>('real-title-provider'))
    session.append('turn/start', {
      turn: 1,
    })
    const message = session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'Explain why append-only logs make session titles durable.' }],
      source: { kind: 'user' },
    }), { surfaceOp: 'append' })

    const title = await ctx.sessionTitle.refresh(session)

    expect(title).toMatchObject({
      messageSeqs: [message.seq],
      source: {
        kind: 'provider',
        provider: 'session-title-first-prompt-llm',
        model: { provider: 'deepseek-official', model: 'deepseek-v4-flash' },
      },
    })
    expect(title?.title.length).toBeGreaterThan(0)
    expect(Buffer.byteLength(title?.title ?? '', 'utf8')).toBeLessThanOrEqual(80)
  })
})
