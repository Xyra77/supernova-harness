import { describe, expect, it, vi } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import { brandString } from '@supernova-ai/snh-brand'
import AgentRegistry from '@supernova-ai/snh-agent'
import type { SessionId, SessionHeader } from '@supernova-ai/snh-session'
import { SESSION_FORMAT_VERSION } from '@supernova-ai/snh-session'
import SessionStore from '@supernova-ai/snh-session'
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import { SessionPersistenceRevision } from '@supernova-ai/snh-session-persistence'
import { createSessionTestRemote } from './test-remote.ts'

const sid = (id: string): SessionId => brandString<SessionId>(id)

async function setup(header: SessionHeader) {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(AgentRegistry)

  let stored: SessionHeader | undefined = header
  const persistence = {
    stat: vi.fn(async (sessionId: SessionId) => {
      const current = stored
      return current?.id === sessionId
        ? { header: current, revision: SessionPersistenceRevision('test:1') }
        : undefined
    }),
    delete: vi.fn(async (sessionId: SessionId) => {
      if (stored?.id === sessionId) stored = undefined
    }),
  }
  const removeSession = vi.fn(async () => {})
  ctx.provide('sessionPersistence', persistence as never)
  ctx.provide('workspaceRegistry', { archivedSessionIds: [], removeSession } as never)

  const remote = await createSessionTestRemote(ctx, {
    defaultModelSelection: () => ({ provider: 'test', model: 'test' }),
    cwd: '/tmp',
  })
  return { remote, persistence, removeSession, stored: () => stored }
}

describe('sessions.delete', () => {
  it('permanently removes a cold ordinary session and its workspace membership', async () => {
    const sessionId = sid('session-delete-cold')
    const header: SessionHeader = {
      version: SESSION_FORMAT_VERSION,
      id: sessionId,
      createdAt: 1,
      isSeeded: false,
      cwd: '/project',
    }
    const fixture = await setup(header)

    const response = await fixture.remote.delete({ sessionId })

    expect(response).toEqual({ ok: true, value: { deleted: true } })
    expect(fixture.persistence.delete).toHaveBeenCalledOnce()
    expect(fixture.persistence.delete).toHaveBeenCalledWith(sessionId)
    expect(fixture.stored()).toBeUndefined()
    expect(fixture.removeSession).toHaveBeenCalledOnce()
    expect(fixture.removeSession).toHaveBeenCalledWith(sessionId)
  })

  it('refuses deletion of subagent-owned sessions before touching storage or workspace state', async () => {
    const sessionId = sid('session-delete-subagent')
    const header: SessionHeader = {
      version: SESSION_FORMAT_VERSION,
      id: sessionId,
      createdAt: 1,
      isSeeded: false,
      origin: 'subagent',
      delegationDepth: 1,
    }
    const fixture = await setup(header)

    const response = await fixture.remote.delete({ sessionId })

    expect(response.ok).toBe(false)
    if (!response.ok) expect(response.error.code).toBe('session/agent-busy')
    expect(fixture.persistence.delete).not.toHaveBeenCalled()
    expect(fixture.stored()).toEqual(header)
    expect(fixture.removeSession).not.toHaveBeenCalled()
  })

  it('returns not-found for an already deleted session', async () => {
    const sessionId = sid('session-delete-missing')
    const header: SessionHeader = {
      version: SESSION_FORMAT_VERSION,
      id: sessionId,
      createdAt: 1,
      isSeeded: false,
    }
    const fixture = await setup(header)
    const first = await fixture.remote.delete({ sessionId })
    expect(first.ok).toBe(true)

    const second = await fixture.remote.delete({ sessionId })

    expect(second.ok).toBe(false)
    if (!second.ok) expect(second.error.code).toBe('session/not-found')
    expect(fixture.persistence.delete).toHaveBeenCalledOnce()
  })
})
