import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AGENTS_HOME_DIR_NAME,
  DEFAULT_AGENTS_HOME_DISPLAY,
  DEFAULT_SNH_HOME_DISPLAY,
  SNH_HOME_DIR_NAME,
  agentsHomeDisplay,
  canonicalizeWatchPath,
  defaultAgentsHome,
  defaultSnhHome,
  snhCachePath,
  snhHomeDisplay,
  snhHomePath,
  snhPath,
  expandHomePath,
  resolveAgentsHome,
  resolveSnhHome,
} from '@supernova-ai/snh-home-paths'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('snh path helpers', () => {
  it('owns the shared default SNH home directory name', () => {
    expect(SNH_HOME_DIR_NAME).toBe('.snh')
    expect(DEFAULT_SNH_HOME_DISPLAY).toBe('~/.snh')
    expect(defaultSnhHome()).toBe(join(homedir(), '.snh'))
  })

  it('expands tilde paths without changing non-tilde paths', () => {
    expect(expandHomePath('~')).toBe(homedir())
    expect(expandHomePath('~/.snh')).toBe(join(homedir(), '.snh'))
    expect(expandHomePath('~\\.snh')).toBe(join(homedir(), '.snh'))
    expect(expandHomePath('/tmp/.snh')).toBe('/tmp/.snh')
    expect(expandHomePath('~other/.snh')).toBe('~other/.snh')
  })

  it('resolves explicit path before SNH_HOME and the default', () => {
    const envHome = join(homedir(), 'env-snh')

    expect(resolveSnhHome('/tmp/explicit-snh', { SNH_HOME: '~/env-snh' })).toBe(resolve('/tmp/explicit-snh'))
    expect(resolveSnhHome(undefined, { SNH_HOME: '~/env-snh' })).toBe(envHome)
    expect(resolveSnhHome(undefined, {})).toBe(defaultSnhHome())
  })

  it('treats an empty or whitespace-only SNH_HOME as unset', () => {
    expect(resolveSnhHome(undefined, { SNH_HOME: '' })).toBe(defaultSnhHome())
    expect(resolveSnhHome(undefined, { SNH_HOME: '   ' })).toBe(defaultSnhHome())
  })

  it('joins child segments onto the resolved SNH_HOME', () => {
    vi.stubEnv('SNH_HOME', '~/env-snh')
    expect(snhHomePath()).toBe(join(homedir(), 'env-snh'))
    expect(snhHomePath('storages', 'cache')).toBe(join(homedir(), 'env-snh', 'storages', 'cache'))
  })

  it('labels a resolved home by whether it is the default root', () => {
    expect(snhHomeDisplay(resolve(defaultSnhHome()))).toBe('~/.snh')
    expect(snhHomeDisplay('/some/other/root')).toBe('$SNH_HOME')
  })

  it('owns the shared default agents home directory name', () => {
    expect(AGENTS_HOME_DIR_NAME).toBe('.agents')
    expect(DEFAULT_AGENTS_HOME_DISPLAY).toBe('~/.agents')
    expect(defaultAgentsHome()).toBe(join(homedir(), '.agents'))
  })

  it('resolves an explicit agents home before SNH_AGENTS_HOME and the default', () => {
    const envHome = join(homedir(), 'env-agents')

    expect(resolveAgentsHome('/tmp/explicit-agents', { SNH_AGENTS_HOME: '~/env-agents' })).toBe(resolve('/tmp/explicit-agents'))
    expect(resolveAgentsHome(undefined, { SNH_AGENTS_HOME: '~/env-agents' })).toBe(envHome)
    expect(resolveAgentsHome(undefined, {})).toBe(defaultAgentsHome())
  })

  it('treats an empty or whitespace-only SNH_AGENTS_HOME as unset', () => {
    expect(resolveAgentsHome(undefined, { SNH_AGENTS_HOME: '' })).toBe(defaultAgentsHome())
    expect(resolveAgentsHome(undefined, { SNH_AGENTS_HOME: '   ' })).toBe(defaultAgentsHome())
  })

  it('labels a resolved agents home by whether it is the default root', () => {
    expect(agentsHomeDisplay(resolve(defaultAgentsHome()))).toBe('~/.agents')
    expect(agentsHomeDisplay('/some/other/root')).toBe('$SNH_AGENTS_HOME')
  })

  it.each([
    [undefined, join(homedir(), '.snh')],
    ['', join(homedir(), '.snh')],
    ['   ', join(homedir(), '.snh')],
    ['~/env-snh', join(homedir(), 'env-snh')],
    ['./relative-snh', resolve('./relative-snh')],
  ] as const)('resolves cache paths with SNH_HOME=%j', (home, expectedHome) => {
    vi.stubEnv('SNH_HOME', home)
    try {
      expect(snhCachePath()).toBe(join(expectedHome, 'cache'))
      expect(snhCachePath('models', 'index.json')).toBe(join(expectedHome, 'cache', 'models', 'index.json'))
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('resolves configured cache homes before the environment', () => {
    vi.stubEnv('SNH_HOME', '~/env-snh')
    try {
      expect(snhCachePath({ snhHome: '~/explicit-snh' })).toBe(join(homedir(), 'explicit-snh', 'cache'))
      expect(snhCachePath({ snhHome: './explicit-snh' }, 'attachments', 'request-images'))
        .toBe(resolve('./explicit-snh/cache/attachments/request-images'))
      expect(snhCachePath({}, 'attachments')).toBe(join(homedir(), 'env-snh', 'cache', 'attachments'))
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it.each([
    [undefined, join(homedir(), '.snh')],
    ['', join(homedir(), '.snh')],
    ['~/env-snh', join(homedir(), 'env-snh')],
    ['./relative-snh', resolve('./relative-snh')],
  ] as const)('resolves category paths with SNH_HOME=%j', (home, expectedHome) => {
    vi.stubEnv('SNH_HOME', home)
    for (const category of ['config', 'data', 'state', 'cache', 'backup'] as const) {
      expect(snhPath(category)).toBe(join(expectedHome, category))
      expect(snhPath(category, 'owner', 'file.json')).toBe(join(expectedHome, category, 'owner', 'file.json'))
    }
  })

  it('resolves a configured category home before the environment', () => {
    vi.stubEnv('SNH_HOME', '~/env-snh')
    expect(snhPath({ category: 'state', snhHome: '~/explicit-snh' }, 'logs')).toBe(join(homedir(), 'explicit-snh', 'state', 'logs'))
    expect(snhPath({ category: 'data', snhHome: undefined })).toBe(join(homedir(), 'env-snh', 'data'))
  })

  it('canonicalizes a watcher ancestor while preserving a missing suffix', async () => {
    const root = await mkdtemp(join(tmpdir(), 'snh-watch-path-'))
    const target = join(root, 'target')
    const alias = join(root, 'alias')
    try {
      await mkdir(target)
      await symlink(target, alias, process.platform === 'win32' ? 'junction' : 'dir')
      await expect(canonicalizeWatchPath(alias)).resolves.toBe(await realpath(target))
      await expect(canonicalizeWatchPath(join(alias, 'later', 'config.yml'))).resolves.toBe(
        join(await realpath(target), 'later', 'config.yml'),
      )
      const file = join(root, 'file')
      await writeFile(file, 'not a directory')
      await expect(canonicalizeWatchPath(join(file, 'child'))).rejects.toMatchObject({ code: 'ENOTDIR' })
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
