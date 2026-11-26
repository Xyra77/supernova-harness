import { createRequire } from 'node:module'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { APP_IDENTITY, attributionHeaders, userAgent } from '@supernova-ai/snh-llm'
import type { AppIdentity } from '@supernova-ai/snh-llm'

// The default identity must not depend on the developer's exported suffix.
beforeEach(() => { vi.stubEnv('SNH_USER_AGENT_SUFFIX', undefined) })
afterEach(() => { vi.unstubAllEnvs() })

const manifest = createRequire(import.meta.url)('../package.json') as { version: string }

/** A white-label identity exercising every override hook. */
const forkIdentity: AppIdentity = {
  product: 'fork-agent',
  version: '9.9.9',
  url: 'https://example.com/fork-agent',
}

describe('APP_IDENTITY', () => {
  it('sources the version from the package manifest, never a hand-copied constant', () => {
    expect(APP_IDENTITY.version).toBe(manifest.version)
  })

  it('carries only static public product facts', () => {
    expect(APP_IDENTITY).toEqual({
      product: 'supernova-harness',
      version: manifest.version,
      url: 'https://github.com/deepseek-ai/deepseek-harness',
    })
  })
})

describe('userAgent', () => {
  it('renders product/version with the +url comment', () => {
    expect(userAgent()).toBe(
      `supernova-harness/${manifest.version} (+https://github.com/deepseek-ai/deepseek-harness)`,
    )
  })

  it('renders a custom identity', () => {
    expect(userAgent(forkIdentity)).toBe('fork-agent/9.9.9 (+https://example.com/fork-agent)')
  })

  it('appends the identity suffix after the comment', () => {
    expect(userAgent({ ...forkIdentity, suffix: 'snh-profile/web' })).toBe('fork-agent/9.9.9 (+https://example.com/fork-agent) snh-profile/web')
  })
})

describe('SNH_USER_AGENT_SUFFIX', () => {
  it('appends the launch suffix to the default User-Agent when read', () => {
    vi.stubEnv('SNH_USER_AGENT_SUFFIX', 'snh-profile/my%20web')
    expect(APP_IDENTITY.suffix).toBe('snh-profile/my%20web')
    expect(userAgent()).toBe(`supernova-harness/${manifest.version} (+https://github.com/deepseek-ai/deepseek-harness) snh-profile/my%20web`)
  })

  it.each(['', undefined])('omits the suffix when it is %j', (value) => {
    vi.stubEnv('SNH_USER_AGENT_SUFFIX', value)
    expect(APP_IDENTITY.suffix).toBeUndefined()
    expect(userAgent()).toBe(`supernova-harness/${manifest.version} (+https://github.com/deepseek-ai/deepseek-harness)`)
  })

  it.each(['snh-profile/my web', 'snh-profile/web\r\nx-injected: 1', 'snh-profile/(web)', 'snh-profile/a/b'])('rejects %j', (value) => {
    vi.stubEnv('SNH_USER_AGENT_SUFFIX', value)
    expect(() => userAgent()).toThrow('SNH_USER_AGENT_SUFFIX must be an RFC 9110 product token')
  })
})

describe('attributionHeaders', () => {
  it('defaults to the provider-neutral baseline: User-Agent and nothing else', () => {
    expect(attributionHeaders()).toEqual({ 'user-agent': userAgent() })
  })

  it('maps a custom identity onto the User-Agent header only', () => {
    expect(attributionHeaders(forkIdentity)).toEqual({
      'user-agent': 'fork-agent/9.9.9 (+https://example.com/fork-agent)',
    })
  })
})
