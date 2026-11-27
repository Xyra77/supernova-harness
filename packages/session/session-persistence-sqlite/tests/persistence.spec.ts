/** Shared persistence semantics and SQLite plugin activation. @module */
import { describe, expect, it } from 'vitest'
import { DatabaseSync } from 'node:sqlite'
import { SessionLogOffset, SessionSeq } from '@supernova-ai/snh-session'
import type { SessionEvent } from '@supernova-ai/snh-session'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { meta, oneTurnLog, runPersistenceContract } from '../../session-persistence/tests/contract.ts'
import { persistenceFixture } from './fixtures/persistence.ts'
import { storedEvents } from './fixtures/store.ts'

runPersistenceContract('sqlite', async () => {
  const fixture = await persistenceFixture()
  const backend = await fixture.mount('sqlite')
  return {
    persistence: backend.persistence,
    dispose: () => backend.context.fiber.dispose(),
    reopen: async () => {
      const reopened = await fixture.mount('sqlite')
      return { persistence: reopened.persistence, dispose: () => reopened.context.fiber.dispose() }
    },
  }
})

describe('SQLite persistence plugin', () => {
  it('registers the service before creating the database and initializes on first create', async () => {
    const fixture = await persistenceFixture()
    const { persistence } = await fixture.mount('sqlite')
    expect(persistence).toBeDefined()
    expect(await persistence.list()).toEqual([])
    expect(await readdir(fixture.root)).toEqual([])
    const writer = await persistence.create(meta('first-create'))
    await writer.flush()
    await writer.close()
    expect(await readdir(join(fixture.root, '.segments'))).toContain('sessions.sqlite')
  })

  it('permanent deletion keeps shared fork history reachable and reclaims it after the last descendant is deleted', async () => {
    const fixture = await persistenceFixture()
    const { persistence } = await fixture.mount('sqlite')
    const parent = meta('delete-shared-parent', '/workspace')
    const child = { ...meta('delete-shared-child', '/workspace'), isSeeded: true }
    const history = oneTurnLog()
    const marker: SessionEvent<'session/end-seed'> = {
      type: 'session/end-seed',
      seq: SessionSeq(history.length),
      time: 0,
      data: { inherited: true },
    }

    const parentWriter = await persistence.create(parent)
    await parentWriter.append(history)
    await parentWriter.close()
    const childWriter = await persistence.create(child, {
      inheritedEventCount: SessionLogOffset(history.length),
      parentSource: {
        sessionId: parent.id,
        endSeq: SessionLogOffset(history.length),
        events: [...history, marker],
      },
    })
    await childWriter.close()

    const databasePath = join(fixture.root, '.segments', 'sessions.sqlite')
    const parentTail = (() => {
      const db = new DatabaseSync(databasePath)
      try {
        const row = db.prepare('SELECT tail_segment_uuid FROM traces WHERE trace_uuid = ?').get(parent.id)
        if (typeof row?.tail_segment_uuid !== 'string') throw new Error('parent Trace tail was not stored')
        return row.tail_segment_uuid
      } finally { db.close() }
    })()

    await persistence.delete(parent.id)
    expect(await persistence.stat(parent.id)).toBeUndefined()
    expect((await persistence.list()).map(row => row.header.id)).toEqual([child.id])

    const dbAfterParentDelete = new DatabaseSync(databasePath)
    try {
      expect(dbAfterParentDelete.prepare('SELECT segment_uuid FROM segments WHERE segment_uuid = ?').get(parentTail))
        .toBeDefined()
    } finally {
      dbAfterParentDelete.close()
    }
    const childReader = await persistence.open(child.id, 'read')
    expect((await childReader.read()).events).toEqual([...history, marker])
    await childReader.close()

    await persistence.delete(child.id)
    expect(await persistence.list()).toEqual([])
    const dbAfterAllDeletes = new DatabaseSync(databasePath)
    try {
      expect(dbAfterAllDeletes.prepare('SELECT COUNT(*) AS count FROM segments').get()).toMatchObject({ count: 0 })
      expect(dbAfterAllDeletes.prepare('SELECT COUNT(*) AS count FROM frames').get()).toMatchObject({ count: 0 })
    } finally {
      dbAfterAllDeletes.close()
    }
  })

  it('stores one complete logical event stream in an independent root segment', async () => {
    const fixture = await persistenceFixture()
    const { persistence, context } = await fixture.mount('sqlite')
    const header = meta('root-segment', '/workspace')
    const events = oneTurnLog()
    const writer = await persistence.create(header)
    await writer.append(events)
    await writer.close()
    await context.fiber.dispose()
    const db = new DatabaseSync(join(fixture.root, '.segments', 'sessions.sqlite'))
    try {
      const thread = db.prepare('SELECT header, tail_segment_uuid FROM traces WHERE trace_uuid = ?').get(header.id)
      expect(JSON.parse(String(thread?.header))).toEqual({ ...header, delegationDepth: 0 })
      const segment = db.prepare('SELECT parent_segment_uuid, parent_end_seq, base_seq FROM segments WHERE segment_uuid = ?').get(thread?.tail_segment_uuid as string)
      expect(segment).toEqual({ parent_segment_uuid: null, parent_end_seq: null, base_seq: 0 })
      expect(storedEvents(db, thread?.tail_segment_uuid as string)).toEqual(events)
    } finally {
      db.close()
    }
  })

  it('keeps the default JSONL provider independent of SQLite storage', async () => {
    const fixture = await persistenceFixture()
    const { persistence } = await fixture.mount('jsonl')
    const writer = await persistence.create(meta('default-jsonl', '/workspace'))
    await writer.append(oneTurnLog())
    await writer.close()
    expect(await readdir(fixture.root)).not.toContain('.segments')
  })

  it('drains live Session events before provider disposal', async () => {
    const fixture = await persistenceFixture()
    const { persistence, context } = await fixture.mount('sqlite')
    const session = context.sessions.create(meta('shutdown-drain').id)
    await persistence.create(session.header)
    const events = [
      session.append('turn/start', { turn: 1 }),
      session.append('turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ]
    await context.fiber.dispose()
    const reopened = await fixture.mount('sqlite')
    const reader = await reopened.persistence.open(session.id, 'read')
    expect((await reader.read()).events).toEqual(events)
    await reader.close()
  })
})
