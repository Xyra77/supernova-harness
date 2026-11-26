/**
 * Registry tests for `@supernova-ai/snh-shell-env`: built-in facts, contributor
 * ownership and validation, collection ordering, effect-scoped disposal, and
 * the explicit disposer contract.
 */

import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import type { ToolCallId } from '@supernova-ai/snh-llm'
import type { Agent } from '@supernova-ai/snh-agent'
import { SESSION_FORMAT_VERSION } from '@supernova-ai/snh-session'
import type { ToolExecution } from '@supernova-ai/snh-tools'
import { ShellEnvRegistry } from '@supernova-ai/snh-shell-env'
import * as BashEnvPlugin from '@supernova-ai/snh-shell-env'
import { brandString } from '@supernova-ai/snh-brand'

const testToolSignal = new AbortController().signal

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks() })

function execution(sessionId?: string): ToolExecution {
  return {
    signal: testToolSignal,
    token: Symbol('bash-env-test') as ToolExecution['token'],
    callId: brandString<ToolCallId>('bash-env-call'),
    rootCallId: brandString<ToolCallId>('bash-env-call'),
    name: 'bash',
    arguments: { command: 'true' },
    ...(sessionId === undefined
      ? {}
      : {
        agent: {
          session: {
            header: { version: SESSION_FORMAT_VERSION, id: sessionId, createdAt: 0, isSeeded: false },
          },
        } as unknown as Agent,
      }),
  }
}

describe('ShellEnvRegistry', () => {
  it('collects unconditional shell facts and the current agent session id', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { snhHome: './test-snh-home' })

    expect(registry.collect(execution())).toEqual({
      SNH_HOME: resolve('./test-snh-home'),
      SNH_NODE_EXECUTABLE: process.execPath,
      SNH_SHELL: '1',
    })
    expect(registry.collect(execution('session-a'))).toEqual({
      SNH_HOME: resolve('./test-snh-home'),
      SNH_NODE_EXECUTABLE: process.execPath,
      SNH_SESSION_ID: 'session-a',
      SNH_SHELL: '1',
    })
  })

  it('omits the Node executable inside a single-executable application', () => {
    vi.spyOn(process, 'getBuiltinModule').mockReturnValue({ isSea: () => true })
    expect(new ShellEnvRegistry(new Context()).collect(execution())).not.toHaveProperty('SNH_NODE_EXECUTABLE')
  })

  it('keeps the Node executable where the runtime answers no single-executable module', () => {
    vi.spyOn(process, 'getBuiltinModule').mockReturnValue(undefined)
    expect(new ShellEnvRegistry(new Context()).collect(execution()).SNH_NODE_EXECUTABLE).toBe(process.execPath)
  })

  it('collects the launcher-provided profile name, directory, and installation directory when a profile context exists', () => {
    const ctx = new Context()
    ctx.provide('profileContext', {
      name: 'web', dir: '/profiles/web', patchPath: '/profiles/web/cordis.patch.yml', installAnchor: '/snh/package.json',
      cwd: '/work', home: '/home', startedBundles: [], overlayPaths: [], telemetryDisabledEnv: undefined,
    })
    const registry = new ShellEnvRegistry(ctx, { snhHome: './test-snh-home' })
    expect(registry.collect(execution())).toMatchObject({
      SNH_INSTALL_DIR: '/snh', SNH_PROFILE: 'web', SNH_PROFILE_DIR: '/profiles/web',
    })
    for (const key of ['SNH_PROFILE', 'SNH_INSTALL_DIR', 'SNH_NODE_EXECUTABLE']) {
      expect(() => registry.register({
        name: `${key}-claimer`,
        variables: { [key]: { description: 'Reserved key.' } },
        resolve: () => ({}),
      })).toThrow(new RegExp(`reserved key "${key}"`))
    }
  })

  it('resolves SNH_HOME from the ambient override or the user-home default', () => {
    vi.stubEnv('SNH_HOME', './ambient-snh-home')
    const fromEnvironment = new ShellEnvRegistry(new Context())
    expect(fromEnvironment.collect(execution()).SNH_HOME).toBe(resolve('./ambient-snh-home'))

    vi.stubEnv('SNH_HOME', undefined)
    const fromDefault = new ShellEnvRegistry(new Context())
    expect(fromDefault.collect(execution()).SNH_HOME).toBe(join(homedir(), '.snh'))
  })

  it('collects declared contributor variables and omits unavailable values', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { snhHome: './test-snh-home' })
    registry.register({
      name: 'optional-session-fact',
      variables: {
        SNH_SESSION_OPTIONAL: { description: 'Optional session-scoped test fact.' },
      },
      resolve: exec => exec.agent === undefined ? {} : { SNH_SESSION_OPTIONAL: exec.agent.session.header.id },
    })
    registry.register({
      name: 'always-available-fact',
      variables: {
        SNH_ALWAYS_AVAILABLE: { description: 'Always-available test fact.' },
      },
      resolve: () => ({ SNH_ALWAYS_AVAILABLE: 'yes' }),
    })

    expect(registry.collect(execution())).not.toHaveProperty('SNH_SESSION_OPTIONAL')
    expect(registry.collect(execution()).SNH_ALWAYS_AVAILABLE).toBe('yes')
    expect(registry.collect(execution('session-b')).SNH_SESSION_OPTIONAL).toBe('session-b')
    expect(registry.list()).toEqual([
      {
        contributor: 'always-available-fact',
        description: 'Always-available test fact.',
        key: 'SNH_ALWAYS_AVAILABLE',
      },
      {
        contributor: 'optional-session-fact',
        description: 'Optional session-scoped test fact.',
        key: 'SNH_SESSION_OPTIONAL',
      },
    ])
  })

  it('rejects duplicate variable ownership at registration time', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { snhHome: './test-snh-home' })
    registry.register({
      name: 'first',
      variables: { SNH_SHARED: { description: 'First owner.' } },
      resolve: () => ({ SNH_SHARED: 'first' }),
    })

    expect(() => registry.register({
      name: 'second',
      variables: { SNH_SHARED: { description: 'Second owner.' } },
      resolve: () => ({ SNH_SHARED: 'second' }),
    })).toThrow(/SNH_SHARED.*first.*second|SNH_SHARED.*second.*first/)
  })

  it('rejects duplicate contributor names and malformed declarations', () => {
    const registry = new ShellEnvRegistry(new Context(), { snhHome: './test-snh-home' })
    registry.register({
      name: 'declared',
      variables: { SNH_DECLARED: { description: 'Declared fact.' } },
      resolve: () => ({}),
    })

    expect(() => registry.register({
      name: 'declared',
      variables: { SNH_ANOTHER: { description: 'Another fact.' } },
      resolve: () => ({}),
    })).toThrow(/already registered/)
    expect(() => registry.register({
      name: ' ',
      variables: { SNH_BLANK_NAME: { description: 'Blank owner.' } },
      resolve: () => ({}),
    })).toThrow(/name must be non-empty/)
    expect(() => registry.register({
      name: 'invalid-key',
      variables: { snh_invalid: { description: 'Invalid key.' } } as unknown as Record<'SNH_INVALID', { description: string }>,
      resolve: () => ({}),
    })).toThrow(/invalid key/)
    expect(() => registry.register({
      name: 'reserved-key',
      variables: { SNH_HOME: { description: 'Reserved key.' } },
      resolve: () => ({}),
    })).toThrow(/reserved key/)
    expect(() => registry.register({
      name: 'blank-description',
      variables: { SNH_BLANK_DESCRIPTION: { description: ' ' } },
      resolve: () => ({}),
    })).toThrow(/must describe/)
  })

  it('rejects undeclared variables returned by a contributor', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { snhHome: './test-snh-home' })
    registry.register({
      name: 'drifted-provider',
      variables: { SNH_DECLARED: { description: 'Declared fact.' } },
      resolve: () => ({ SNH_UNDECLARED: 'bad' }),
    })

    expect(() => registry.collect(execution())).toThrow(/drifted-provider.*SNH_UNDECLARED/)
    expect(() => registry.collect(execution())).toThrow(expect.objectContaining({ name: 'ShellEnvError', code: 'SHELL_ENV_CONTRIBUTION_INVALID' }))
  })

  it('rejects non-string values returned by a contributor', () => {
    const registry = new ShellEnvRegistry(new Context(), { snhHome: './test-snh-home' })
    registry.register({
      name: 'wrong-value-type',
      variables: { SNH_STRING: { description: 'String fact.' } },
      resolve: () => ({ SNH_STRING: 42 }) as unknown as Record<'SNH_STRING', string>,
    })

    expect(() => registry.collect(execution())).toThrow(/wrong-value-type.*non-string.*SNH_STRING/)
    expect(() => registry.collect(execution())).toThrow(expect.objectContaining({ name: 'ShellEnvError', code: 'SHELL_ENV_CONTRIBUTION_INVALID' }))
  })

  it('removes an effect-scoped contributor when its plugin is disposed', async () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { snhHome: './test-snh-home' })
    const fiber = await ctx.plugin({
      inject: ['shellEnv'],
      apply(inner: Context) {
        inner.shellEnv.register({
          name: 'temporary',
          variables: { SNH_TEMPORARY: { description: 'Temporary fact.' } },
          resolve: () => ({ SNH_TEMPORARY: 'present' }),
        })
      },
    })

    expect(registry.collect(execution()).SNH_TEMPORARY).toBe('present')
    await fiber.dispose()
    expect(registry.collect(execution())).not.toHaveProperty('SNH_TEMPORARY')
  })

  it('returns an explicit contributor disposer', () => {
    const registry = new ShellEnvRegistry(new Context(), { snhHome: './test-snh-home' })
    const dispose = registry.register({
      name: 'explicit-disposal',
      variables: { SNH_EXPLICIT_DISPOSAL: { description: 'Explicitly disposed fact.' } },
      resolve: () => ({ SNH_EXPLICIT_DISPOSAL: 'present' }),
    })

    expect(registry.collect(execution()).SNH_EXPLICIT_DISPOSAL).toBe('present')
    dispose()
    expect(registry.collect(execution())).not.toHaveProperty('SNH_EXPLICIT_DISPOSAL')
  })

  it('the plugin registers the service with no contributors on load', async () => {
    const ctx = new Context()
    await ctx.plugin(BashEnvPlugin)
    expect(ctx.shellEnv).toBeInstanceOf(ShellEnvRegistry)
    expect(ctx.shellEnv.list()).toEqual([])
  })
})
