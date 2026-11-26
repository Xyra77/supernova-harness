/**
 * The identity, timestamp, link, mutation, and durability-sink guarantees
 * MemoryVfs owes its consumers, asserted directly rather than through the
 * `node:fs` bridge.
 *
 * `snh-fs-local` builds a version token from `dev:ino:size:mtimeNs:ctimeNs` and
 * refuses a write whose token moved since it read. Two properties carry that:
 * `ino` identifies the entry at a path, and `mtimeMs` moves on every write. The
 * timestamp cases freeze the clock, because these writes are in memory and two
 * revisions routinely land in the same millisecond — a real-clock test passes
 * whether or not the strict increment exists.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryVfs } from '../../src/storage/memory.ts'
import type { VfsBigIntStats, VfsMutation, VfsMutationSink, VfsStats } from '../../src/storage/types.ts'

const identity = (vfs: MemoryVfs, path: string): bigint =>
  (vfs.statSync(path, { bigint: true }) as VfsBigIntStats).ino

const linkCount = (vfs: MemoryVfs, path: string): bigint =>
  (vfs.statSync(path, { bigint: true }) as VfsBigIntStats).nlink

const modified = (vfs: MemoryVfs, path: string): number => (vfs.statSync(path) as VfsStats).mtimeMs

afterEach(() => { vi.restoreAllMocks() })

describe('entry identity', () => {
  it('distinguishes paths and holds each identity across repeated stats', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/one.txt', 'one')
    vfs.seed('/snh/two.txt', 'two')
    const first = identity(vfs, '/snh/one.txt')
    expect(identity(vfs, '/snh/two.txt')).not.toBe(first)
    expect(identity(vfs, '/snh/one.txt')).toBe(first)
  })

  it('forgets the identities under a directory removed as a subtree', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/skills/git/SKILL.md', '# git\n')
    const before = identity(vfs, '/snh/skills/git/SKILL.md')
    vfs.rmSync('/snh/skills', { recursive: true })
    vfs.seed('/snh/skills/git/SKILL.md', '# git rebuilt\n')
    expect(identity(vfs, '/snh/skills/git/SKILL.md')).not.toBe(before)
  })

  it('moves the source identity when a file replaces another path', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/from.txt', 'moved')
    vfs.seed('/snh/to.txt', 'replaced')
    const [source, destination] = [identity(vfs, '/snh/from.txt'), identity(vfs, '/snh/to.txt')]
    vfs.renameSync('/snh/from.txt', '/snh/to.txt')
    const renamed = identity(vfs, '/snh/to.txt')
    expect(vfs.readFileSync('/snh/to.txt', 'utf8')).toBe('moved')
    expect([renamed === source, renamed === destination]).toEqual([true, false])
  })
})

describe('modification time', () => {
  it('hydrates explicit metadata without confusing timestamps with permission bits', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/restored', 'value', { mode: 0o600, mtimeMs: 1_600_000_000_000 })
    vfs.seedDirectory('/snh/restored-directory', { mode: 0o700, mtimeMs: 1_600_000_000_001 })
    const stats = vfs.statSync('/snh/restored') as VfsStats
    const directory = vfs.statSync('/snh/restored-directory') as VfsStats
    expect([stats.mode & 0o777, stats.mtimeMs]).toEqual([0o600, 1_600_000_000_000])
    expect([directory.mode & 0o777, directory.mtimeMs]).toEqual([0o700, 1_600_000_000_001])
  })

  it('advances on every write even while the clock stands still', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const vfs = new MemoryVfs()
    vfs.seed('/snh/log.jsonl', 'first\n')
    const seeded = modified(vfs, '/snh/log.jsonl')
    vfs.writeFileSync('/snh/log.jsonl', 'second\n')
    const written = modified(vfs, '/snh/log.jsonl')
    vfs.appendFileSync('/snh/log.jsonl', 'third\n')
    const appended = modified(vfs, '/snh/log.jsonl')
    vfs.truncateSync('/snh/log.jsonl', 6)
    const truncated = modified(vfs, '/snh/log.jsonl')
    expect([written > seeded, appended > written, truncated > appended]).toEqual([true, true, true])
    // One millisecond per revision: the increment is the minimum that separates
    // two tokens, not a coarser bump that would skew a real timestamp.
    expect(truncated - seeded).toBe(3)
  })

  it('takes the clock once the clock has passed the entry', () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const vfs = new MemoryVfs()
    vfs.seed('/snh/log.jsonl', 'first\n')
    clock.mockReturnValue(1_700_000_005_000)
    vfs.writeFileSync('/snh/log.jsonl', 'second\n')
    expect(modified(vfs, '/snh/log.jsonl')).toBe(1_700_000_005_000)
  })

  it('extends truncation with zero bytes', async () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/file', new Uint8Array([1, 2]))
    vfs.truncateSync('/snh/file', 5)
    expect([...vfs.readFileSync('/snh/file') as Uint8Array]).toEqual([1, 2, 0, 0, 0])
    const handle = vfs.open('/snh/file', 'r+')
    await handle.truncate(7)
    expect([...vfs.readFileSync('/snh/file') as Uint8Array]).toEqual([1, 2, 0, 0, 0, 0, 0])
  })

  it('advances a directory only when its immediate entry set changes', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const vfs = new MemoryVfs()
    vfs.seedDirectory('/snh/workspace')
    const empty = modified(vfs, '/snh/workspace')
    vfs.writeFileSync('/snh/workspace/file.txt', 'one')
    const created = modified(vfs, '/snh/workspace')
    vfs.writeFileSync('/snh/workspace/file.txt', 'two')
    const rewritten = modified(vfs, '/snh/workspace')
    vfs.rmSync('/snh/workspace/file.txt')
    const removed = modified(vfs, '/snh/workspace')
    expect([created > empty, rewritten === created, removed > rewritten]).toEqual([true, true, true])
  })
})

describe('mutation publication', () => {
  it('publishes only committed runtime changes and keeps image seeding silent', () => {
    const vfs = new MemoryVfs()
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })
    vfs.seed('/snh/seeded.txt', 'seeded')
    expect(mutations).toEqual([])
    vfs.writeFileSync('/snh/seeded.txt', 'changed')
    vfs.mkdirSync('/snh/created')
    vfs.chmodSync('/snh/created', 0o700)
    vfs.renameSync('/snh/seeded.txt', '/snh/renamed.txt')
    vfs.rmSync('/snh/created', { recursive: true })
    expect(mutations.map(mutation => ({
      kind: mutation.kind,
      path: mutation.path,
      ...mutation.kind === 'write' ? { entryChanged: mutation.entryChanged } : {},
      ...mutation.kind === 'chmod' ? { mode: mutation.mode } : {},
    }))).toEqual([
      { kind: 'write', path: '/snh/seeded.txt', entryChanged: false },
      { kind: 'mkdir', path: '/snh/created' },
      { kind: 'chmod', path: '/snh/created', mode: 0o700 },
      { kind: 'remove', path: '/snh/seeded.txt' },
      { kind: 'write', path: '/snh/renamed.txt', entryChanged: true },
      { kind: 'remove', path: '/snh/created' },
    ])
    const renamed = mutations[4]
    expect(renamed?.kind === 'write' && new TextDecoder().decode(renamed.bytes)).toBe('changed')
    expect(() => { vfs.writeFileSync('/missing/file', 'no') }).toThrow(/ENOENT/)
    expect(mutations).toHaveLength(6)
  })

  it('contains a faulty observer and lets disposal stop later notifications', () => {
    const vfs = new MemoryVfs()
    vfs.seedDirectory('/snh')
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {})
    const first = vfs.subscribe(() => { throw new Error('observer failed') })
    const seen: string[] = []
    const second = vfs.subscribe((mutation) => { seen.push(mutation.path) })
    vfs.writeFileSync('/snh/one', '1')
    first()
    second()
    vfs.writeFileSync('/snh/two', '2')
    expect(seen).toEqual(['/snh/one'])
    expect(reported).toHaveBeenCalledOnce()
  })

  it('feeds the same complete mutations to a durable sink and live subscribers', async () => {
    const recorded: VfsMutation[] = []
    let flushes = 0
    const sink: VfsMutationSink = {
      record: (mutation) => { recorded.push(mutation) },
      flush: async () => { flushes += 1 },
    }
    const vfs = new MemoryVfs({ sink })
    vfs.seedDirectory('/snh')
    const observed: VfsMutation[] = []
    vfs.subscribe((mutation) => { observed.push(mutation) })
    vfs.writeFileSync('/snh/log', 'a')
    vfs.appendFileSync('/snh/log', 'bc')
    await vfs.flush()
    expect(observed).toEqual(recorded)
    expect(observed[0]).toBe(recorded[0])
    expect(recorded[0]).toMatchObject({ kind: 'write', path: '/snh/log', mode: 0o644, entryChanged: true })
    expect(recorded[1]).toMatchObject({ kind: 'write', path: '/snh/log', mode: 0o644, entryChanged: false, appendedFrom: 1 })
    expect(recorded[1]?.kind === 'write' && new TextDecoder().decode(recorded[1].bytes)).toBe('abc')
    expect(flushes).toBe(1)
  })

  it('publishes descriptor writes at the file identity current path', () => {
    const mutations: VfsMutation[] = []
    const vfs = new MemoryVfs()
    vfs.seed('/snh/source', 'old')
    const descriptor = vfs.openFileSync('/snh/source', 'r+')
    vfs.subscribe((mutation) => { mutations.push(mutation) })
    vfs.renameSync('/snh/source', '/snh/destination')
    mutations.length = 0
    descriptor.write(0, new TextEncoder().encode('new'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/snh/destination'])
    expect(vfs.readFileSync('/snh/destination', 'utf8')).toBe('new')
    vfs.unlinkSync('/snh/destination')
    mutations.length = 0
    descriptor.write(0, new TextEncoder().encode('detached'))
    expect(mutations).toEqual([])
    expect(new TextDecoder().decode(descriptor.read(0, descriptor.stat().size))).toBe('detached')
  })

  it('reports the path identity through a BigInt file handle stat', async () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/session.lock', '')
    const handle = vfs.open('/snh/session.lock', 'w')
    const held = await handle.stat({ bigint: true }) as VfsBigIntStats
    const current = vfs.statSync('/snh/session.lock', { bigint: true }) as VfsBigIntStats

    expect([held.dev, held.ino]).toEqual([current.dev, current.ino])
    await handle.chmod(0o600)
    expect((vfs.statSync('/snh/session.lock') as VfsStats).mode & 0o777).toBe(0o600)
    await handle.close()
  })

  it('decomposes a directory rename into replayable destination state', () => {
    const recorded: VfsMutation[] = []
    const vfs = new MemoryVfs({
      sink: { record: (mutation) => { recorded.push(mutation) }, flush: () => Promise.resolve() },
    })
    vfs.seedDirectory('/snh/staging/nested', { mode: 0o700 })
    vfs.seed('/snh/staging/nested/file', 'value', { mode: 0o600 })
    vfs.renameSync('/snh/staging', '/snh/published')

    expect(recorded.map(mutation => [mutation.kind, mutation.path])).toEqual([
      ['remove', '/snh/staging'],
      ['mkdir', '/snh/published'],
      ['mkdir', '/snh/published/nested'],
      ['write', '/snh/published/nested/file'],
    ])
    expect(recorded[3]).toMatchObject({ kind: 'write', mode: 0o600, entryChanged: true })
    expect(recorded[3]?.kind === 'write' && new TextDecoder().decode(recorded[3].bytes)).toBe('value')
  })
})

describe('directory rename', () => {
  it('rejects file, non-empty directory, and missing-parent destinations before mutation', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/source/nested/file', 'source')
    vfs.seed('/snh/file', 'destination')
    vfs.seed('/snh/non-empty/child', 'destination')
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })

    expect(() => { vfs.renameSync('/snh/source', '/snh/file') })
      .toThrow(expect.objectContaining({ code: 'ENOTDIR' }))
    expect(() => { vfs.renameSync('/snh/source', '/snh/non-empty') })
      .toThrow(expect.objectContaining({ code: 'ENOTEMPTY' }))
    expect(() => { vfs.renameSync('/snh/source', '/missing/destination') })
      .toThrow(expect.objectContaining({ code: 'ENOENT' }))

    expect(vfs.readFileSync('/snh/source/nested/file', 'utf8')).toBe('source')
    expect(vfs.readFileSync('/snh/file', 'utf8')).toBe('destination')
    expect(vfs.readFileSync('/snh/non-empty/child', 'utf8')).toBe('destination')
    expect(mutations).toEqual([])
  })

  it('replaces an empty directory with the source subtree', () => {
    const vfs = new MemoryVfs()
    vfs.seedDirectory('/snh/source/nested', { mode: 0o700 })
    vfs.seed('/snh/source/nested/file', 'source')
    vfs.seedDirectory('/snh/destination', { mode: 0o711 })

    vfs.renameSync('/snh/source', '/snh/destination')

    expect(vfs.existsSync('/snh/source')).toBe(false)
    expect(vfs.readFileSync('/snh/destination/nested/file', 'utf8')).toBe('source')
    expect((vfs.statSync('/snh/destination') as VfsStats).mode & 0o777).toBe(0o755)
    expect((vfs.statSync('/snh/destination/nested') as VfsStats).mode & 0o777).toBe(0o700)
  })
})

describe('hard links', () => {
  it('shares identity, bytes, and mode until one name is removed', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/session.jsonl', 'committed\n')
    vfs.linkSync('/snh/session.jsonl', '/snh/session-latest.jsonl')
    vfs.linkSync('/snh/session-latest.jsonl', '/snh/session-archive.jsonl')
    expect(identity(vfs, '/snh/session-latest.jsonl')).toBe(identity(vfs, '/snh/session.jsonl'))
    expect(linkCount(vfs, '/snh/session.jsonl')).toBe(3n)
    expect(vfs.readFileSync('/snh/session-latest.jsonl', 'utf8')).toBe('committed\n')
    const changedPaths: string[] = []
    vfs.subscribe((mutation) => { changedPaths.push(mutation.path) })
    vfs.appendFileSync('/snh/session.jsonl', 'appended\n')
    expect(changedPaths).toEqual([
      '/snh/session.jsonl',
      '/snh/session-latest.jsonl',
      '/snh/session-archive.jsonl',
    ])
    expect(vfs.readFileSync('/snh/session.jsonl', 'utf8')).toBe('committed\nappended\n')
    expect(vfs.readFileSync('/snh/session-latest.jsonl', 'utf8')).toBe('committed\nappended\n')
    vfs.chmodSync('/snh/session-latest.jsonl', 0o600)
    expect((vfs.statSync('/snh/session.jsonl') as VfsStats).mode & 0o777).toBe(0o600)
    vfs.unlinkSync('/snh/session-latest.jsonl')
    expect(linkCount(vfs, '/snh/session.jsonl')).toBe(2n)
    vfs.unlinkSync('/snh/session-archive.jsonl')
    expect(linkCount(vfs, '/snh/session.jsonl')).toBe(1n)
    expect(vfs.readFileSync('/snh/session.jsonl', 'utf8')).toBe('committed\nappended\n')
  })

  it('treats rename between names of the same node as a no-op', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/source', 'value')
    vfs.linkSync('/snh/source', '/snh/alias')
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })

    vfs.renameSync('/snh/source', '/snh/alias')

    expect(vfs.readFileSync('/snh/source', 'utf8')).toBe('value')
    expect(vfs.readFileSync('/snh/alias', 'utf8')).toBe('value')
    expect(linkCount(vfs, '/snh/source')).toBe(2n)
    expect(mutations).toEqual([])
  })

  it('retargets linked names through file replacement and directory moves', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/replacement', 'replacement')
    vfs.seed('/snh/target', 'old')
    vfs.linkSync('/snh/target', '/snh/target-alias')
    const replaced = vfs.openFileSync('/snh/target', 'r+')
    vfs.renameSync('/snh/replacement', '/snh/target')
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })

    replaced.write(0, new TextEncoder().encode('changed'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/snh/target-alias'])
    expect(vfs.readFileSync('/snh/target', 'utf8')).toBe('replacement')
    expect(vfs.readFileSync('/snh/target-alias', 'utf8')).toBe('changed')
    expect(linkCount(vfs, '/snh/target-alias')).toBe(1n)

    vfs.seed('/snh/tree/file', 'tree')
    vfs.linkSync('/snh/tree/file', '/snh/outside')
    const moved = vfs.openFileSync('/snh/tree/file', 'r+')
    vfs.renameSync('/snh/tree', '/snh/moved')
    mutations.length = 0
    moved.write(0, new TextEncoder().encode('moved'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/snh/outside', '/snh/moved/file'])
    expect(linkCount(vfs, '/snh/moved/file')).toBe(2n)

    vfs.rmSync('/snh/moved', { recursive: true })
    mutations.length = 0
    moved.write(0, new TextEncoder().encode('kept!'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/snh/outside'])
    expect(vfs.readFileSync('/snh/outside', 'utf8')).toBe('kept!')
    expect(linkCount(vfs, '/snh/outside')).toBe(1n)
  })

  it('rejects renaming a file over an existing directory', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/snh/file', 'value')
    vfs.seedDirectory('/snh/directory')
    expect(() => { vfs.renameSync('/snh/file', '/snh/directory') }).toThrow(expect.objectContaining({ code: 'EISDIR' }))
    expect(vfs.readFileSync('/snh/file', 'utf8')).toBe('value')
    expect(vfs.statSync('/snh/directory').isDirectory()).toBe(true)
  })
})
