/** Release family discovery, publish order, tag naming, and the bump judgements. */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { officialClientBuildEnvironment, writeClientBuildRecord } from '../client-build-environment.ts'
import { ON_DEMAND_BUNDLES } from '../../packages/util/official-bundles/src/bundles.ts'
import { releaseFamily, type ReleaseMember } from './families.ts'
import { compareVersions, nextVendorVersion, planShared, reachesPayload } from './bump.ts'

/**
 * A release member standing in for a manifest on disk.
 * @param directory - repository-relative package directory.
 * @param name - package name.
 * @param manifest - manifest fields the subject reads.
 * @returns The member.
 */
function member(directory: string, name: string, manifest: Record<string, unknown> = {}): ReleaseMember {
  return { directory, name, version: '0.0.1', manifest }
}

const roots: string[] = []

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

function buildFixture(environment: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'snh-release-build-'))
  roots.push(root)
  write(join(root, 'package.json'), `${JSON.stringify({ version: environment.SNH_CLIENT_VERSION ?? '0.0.1' })}\n`)
  write(join(root, 'apps/web/dist/index.html'), '<main></main>')
  write(join(root, 'packages/client/example/lib/client.js'), 'module.exports = {}\n')
  writeClientBuildRecord(root, environment)
  return root
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
  vi.unstubAllEnvs()
})

describe('release families', () => {
  it('publishes all current experimental packages', () => {
    const members = releaseFamily('snh').members(resolve(import.meta.dirname, '../..'))

    expect(members
      .filter(member => member.directory.startsWith('packages/experimental/'))
      .map(member => member.name)).toEqual([
      '@supernova-ai/snh-experimental-api-speech-to-text',
      '@supernova-ai/snh-experimental-auto-review',
      '@supernova-ai/snh-experimental-badge-skill-bundle',
      '@supernova-ai/snh-experimental-browser-use-chrome-devtools-mcp',
      '@supernova-ai/snh-experimental-browser-use-playwright-mcp',
      '@supernova-ai/snh-experimental-browser-use-runtime',
      '@supernova-ai/snh-experimental-browser-use-stagehand-native',
      '@supernova-ai/snh-experimental-claude-code-mods',
      '@supernova-ai/snh-experimental-client-ui-claude-code-mods',
      '@supernova-ai/snh-experimental-client-ui-cot-translation',
      '@supernova-ai/snh-experimental-client-ui-forge',
      '@supernova-ai/snh-experimental-client-ui-stats',
      '@supernova-ai/snh-experimental-client-ui-voice-input',
      '@supernova-ai/snh-experimental-computer-use-cua-driver-mcp',
      '@supernova-ai/snh-experimental-computer-use-cua-driver-native',
      '@supernova-ai/snh-experimental-cot-translation-bundle',
      '@supernova-ai/snh-cua-bundle',
      '@supernova-ai/snh-cua-macos',
      '@supernova-ai/snh-cua-mcp',
      '@supernova-ai/snh-cua-windows',
      '@supernova-ai/snh-cua',
      '@supernova-ai/snh-deepseek-chat-import',
      '@supernova-ai/snh-experimental-forge-bundle',
      '@supernova-ai/snh-experimental-forge-github',
      '@supernova-ai/snh-forge-gitlab',
      '@supernova-ai/snh-experimental-forge-session',
      '@supernova-ai/snh-experimental-forge',
      '@supernova-ai/snh-hook-protocol',
      '@supernova-ai/snh-hooks-claude-code',
      '@supernova-ai/snh-hooks-codex',
      '@supernova-ai/snh-experimental-inspector-profile',
      '@supernova-ai/snh-experimental-inspector',
      '@supernova-ai/snh-experimental-liveshare-protocol',
      '@supernova-ai/snh-experimental-liveshare',
      '@supernova-ai/snh-experimental-plugin-market-bundle',
      '@supernova-ai/snh-experimental-ralph-bundle',
      '@supernova-ai/snh-experimental-session-inspector',
      '@supernova-ai/snh-experimental-session-search',
      '@supernova-ai/snh-session-title-all-prompts-llm',
      '@supernova-ai/snh-experimental-session-titles-bundle',
      '@supernova-ai/snh-skill-badge',
      '@supernova-ai/snh-experimental-speech-to-text-sensevoice',
      '@supernova-ai/snh-experimental-speech-to-text',
      '@supernova-ai/snh-experimental-subagent-oar',
      '@supernova-ai/snh-experimental-terminal-bundle',
      '@supernova-ai/snh-terminal-panel',
      '@supernova-ai/snh-timeline',
      '@supernova-ai/snh-tool-ralph',
      '@supernova-ai/snh-tool-session-query',
      '@supernova-ai/snh-experimental-tool-subagent-oar',
      '@supernova-ai/snh-tool-terminal',
      '@supernova-ai/snh-experimental-tool-worktree',
      '@supernova-ai/snh-experimental-translator',
      '@supernova-ai/snh-experimental-voice-input-bundle',
      '@supernova-ai/snh-webhook-github',
      '@supernova-ai/snh-webhook',
      '@supernova-ai/snh-experimental-webworker-packer',
      '@supernova-ai/snh-experimental-webworker-runtime',
      '@supernova-ai/snh-experimental-worktree',
    ])
  })

  it('excludes private applications from the publish set', () => {
    const root = mkdtempSync(join(tmpdir(), 'snh-release-private-'))
    roots.push(root)
    write(join(root, 'apps/public/package.json'), '{"name":"@supernova-ai/snh-public","version":"0.0.1"}\n')
    write(join(root, 'apps/private/package.json'), '{"name":"@supernova-ai/snh-private","version":"0.0.1","private":true}\n')

    expect(releaseFamily('snh').members(root).map(entry => entry.name)).toEqual(['@supernova-ai/snh-public'])
  })

  it('publishes unlisted experimental packages while retaining private exclusions', () => {
    const root = mkdtempSync(join(tmpdir(), 'snh-release-experimental-'))
    roots.push(root)
    write(join(root, 'packages/experimental/prototype/package.json'), JSON.stringify({
      name: '@supernova-ai/snh-experimental-prototype',
      version: '0.0.1',
      publishConfig: { access: 'public' },
    }))
    write(join(root, 'packages/experimental/inspector/package.json'), JSON.stringify({
      name: '@supernova-ai/snh-experimental-inspector',
      version: '0.0.1',
      private: true,
    }))

    expect(releaseFamily('snh').members(root).map(entry => entry.name)).toEqual([
      '@supernova-ai/snh-experimental-prototype',
    ])
  })

  it('bumps private snh workspaces without adding release tags', () => {
    const root = mkdtempSync(join(tmpdir(), 'snh-release-version-'))
    roots.push(root)
    write(join(root, 'package.json'), '{"version":"0.0.1"}\n')
    write(join(root, 'apps/desktop/package.json'), '{"version":"0.0.1","private":true}\n')
    write(join(root, 'packages/experimental/prototype/package.json'), '{"version":"0.0.1","private":true}\n')
    write(join(root, 'packages/core/unselected/package.json'), '{"version":"0.0.1"}\n')

    const snh = releaseFamily('snh')
    const published = member('packages/core/published', '@supernova-ai/snh-published')
    const { planned } = planShared(snh, root, [published], '0.0.2')

    expect(planned.map(entry => ({ path: entry.manifestPath, tag: entry.tag }))).toEqual([
      { path: 'package.json', tag: undefined },
      { path: 'packages/core/published/package.json', tag: 'snh-v0.0.2' },
      { path: 'apps/desktop/package.json', tag: undefined },
      { path: 'packages/experimental/prototype/package.json', tag: undefined },
    ])
  })

  it.each(['0.0.2-alpha.1', '0.0.2-canary.1', '0.0.2-rc.1'])(
    'accepts the explicit snh prerelease version %s',
    (version) => {
      const root = mkdtempSync(join(tmpdir(), 'snh-release-prerelease-'))
      roots.push(root)
      write(join(root, 'package.json'), '{"version":"0.0.1"}\n')

      const snh = releaseFamily('snh')
      const published = member('packages/core/published', '@supernova-ai/snh-published')
      const plan = planShared(snh, root, [published], version)

      expect(plan.version).toBe(version)
      expect(plan.planned[1]?.tag).toBe(`snh-v${version}`)
    },
  )

  it('names one tag for the whole snh family and one per vendored package', () => {
    const snh = releaseFamily('snh')
    const vendor = releaseFamily('vendor')
    const cli = member('apps/cli', '@supernova-ai/snh')
    const cordis = { ...member('vendor/cordis', '@supernova-ai/cordis'), version: '4.0.1' }

    expect(snh.tagFor(cli)).toBe('snh-v0.0.1')
    expect(vendor.tagFor(cordis)).toBe('vendor-cordis-v4.0.1')
    // The prefix is constructed, not recovered from a tag: a version with a
    // hyphen would defeat any suffix-stripping.
    expect(vendor.tagPrefixFor({ ...cordis, version: '4.0.0-rc.7' })).toBe('vendor-cordis-v')
    expect(vendor.tagFor({ ...cordis, version: '4.0.0-rc.7' })).toBe('vendor-cordis-v4.0.0-rc.7')
  })

  it('assigns alpha and canary dist-tags only to snh releases', () => {
    const snh = releaseFamily('snh')
    const vendor = releaseFamily('vendor')

    expect(snh.distTagForVersion('0.0.2-alpha.1')).toBe('alpha')
    expect(snh.distTagForVersion('0.0.2-canary.1')).toBe('canary')
    expect(snh.distTagForVersion('0.0.2-rc.1')).toBe('next')
    expect(snh.distTagForVersion('0.0.2')).toBeUndefined()
    expect(vendor.distTagForVersion('4.0.1-alpha.1')).toBe('next')
    expect(vendor.distTagForVersion('4.0.1-canary.1')).toBe('next')
  })

  it('rejects a family whose members disagree on the shared version', () => {
    const snh = releaseFamily('snh')
    const members = [member('apps/cli', '@supernova-ai/snh'), { ...member('apps/web', '@supernova-ai/snh-web-frontend'), version: '0.0.2' }]

    expect(() => { snh.verifyVersions(members) }).toThrow(/must share one version/)
    expect(() => { snh.verifyVersions([members[0]!]) }).not.toThrow()
  })

  it('accepts independent vendored versions and rejects an unpublishable one', () => {
    const vendor = releaseFamily('vendor')
    const members = [
      { ...member('vendor/cordis', '@supernova-ai/cordis'), version: '4.0.1' },
      { ...member('vendor/cosmokit', '@supernova-ai/cosmokit'), version: '1.8.2' },
    ]

    expect(() => { vendor.verifyVersions(members) }).not.toThrow()
    expect(() => { vendor.verifyVersions([{ ...members[0]!, version: 'latest' }]) }).toThrow(/unpublishable version/)
  })

  it('requires a current official client build only for snh artifacts', () => {
    const snh = releaseFamily('snh')
    const vendor = releaseFamily('vendor')
    const officialEnvironment = officialClientBuildEnvironment(resolve(import.meta.dirname, '../..'))
    vi.stubEnv('SNH_CLIENT_COMMIT_HASH', officialEnvironment.SNH_CLIENT_COMMIT_HASH)
    const official = buildFixture(officialEnvironment)
    const defaultBuild = buildFixture({})
    const missing = join(defaultBuild, 'missing')
    write(join(missing, 'package.json'), `${JSON.stringify({ version: officialEnvironment.SNH_CLIENT_VERSION })}\n`)

    expect(() => { snh.verifyBuildArtifacts(official) }).not.toThrow()
    expect(() => { snh.verifyBuildArtifacts(defaultBuild) }).toThrow(/SNH_CLIENT_TITLE/)
    expect(() => { snh.verifyBuildArtifacts(missing) }).toThrow(/record.*missing/)
    expect(() => { vendor.verifyBuildArtifacts(missing) }).not.toThrow()

    write(join(official, 'packages/client/example/lib/client.js'), 'module.exports = { changed: true }\n')
    expect(() => { snh.verifyBuildArtifacts(official) }).toThrow(/artifacts differ/)
  })

  it('publishes a dependency before its consumer, and orders ties by name', () => {
    const snh = releaseFamily('snh')
    const members = [
      member('packages/a/consumer', '@supernova-ai/snh-consumer', { dependencies: { '@supernova-ai/snh-library': 'workspace:^' } }),
      member('packages/a/library', '@supernova-ai/snh-library'),
      member('packages/a/zebra', '@supernova-ai/snh-zebra'),
    ]

    expect(snh.publishOrder(members).order.map(entry => entry.name)).toEqual([
      '@supernova-ai/snh-library',
      '@supernova-ai/snh-consumer',
      '@supernova-ai/snh-zebra',
    ])
  })

  it('publishes on-demand catalog members before snh without adding installed dependencies', () => {
    const snh = member('apps/cli', '@supernova-ai/snh')
    const providers = ON_DEMAND_BUNDLES.map(name => member(`packages/subagent/${name}`, name))
    const plan = releaseFamily('snh').publishOrder([snh, ...providers])
    expect(plan.order.map(entry => entry.name)).toEqual([...ON_DEMAND_BUNDLES.toSorted(), snh.name])
    expect(snh.manifest).toEqual({})
    expect(plan.droppedPeerEdges).toEqual([])
  })

  it('rejects an advertised provider missing from the public release family', () => {
    expect(() => releaseFamily('snh').publishOrder([member('apps/cli', '@supernova-ai/snh')]))
      .toThrow('Official catalog prerequisite')
  })

  it('keeps catalog prerequisites ahead of a snh peer declaration', () => {
    const snh = member('apps/cli', '@supernova-ai/snh')
    const providers = ON_DEMAND_BUNDLES.map(name => member(`packages/subagent/${name}`, name, {
      peerDependencies: { '@supernova-ai/snh': 'workspace:*' },
    }))
    const plan = releaseFamily('snh').publishOrder([snh, ...providers])
    expect(plan.order.map(entry => entry.name)).toEqual([...ON_DEMAND_BUNDLES.toSorted(), snh.name])
    expect(plan.droppedPeerEdges).toEqual(ON_DEMAND_BUNDLES.toSorted().map(name => ({ consumer: name, peer: snh.name })))
  })

  it.each(['dependencies', 'optionalDependencies', 'peerDependencies'])(
    'requires exact packed SNH %s while preserving external ranges', (section) => {
      const pkg = member('packages/example/provider', '@supernova-ai/snh-provider')
      const family = releaseFamily('snh')
      const manifest = { name: pkg.name, version: pkg.version, [section]: { '@supernova-ai/snh-tools': pkg.version, external: '^4.0.0' } }
      expect(() => { family.validatePackedManifest(pkg, manifest) }).not.toThrow()
      for (const range of ['workspace:*', '^0.0.1', '~0.0.1', '0.0.2', '*']) {
        expect(() => { family.validatePackedManifest(pkg, { ...manifest, [section]: { '@supernova-ai/snh-tools': range } }) })
          .toThrow(`packed ${section}.@supernova-ai/snh-tools must equal`)
      }
    },
  )

  it('checks packed identities and preserves independent vendor versions', () => {
    const pkg = member('vendor/example', '@supernova-ai/example')
    const family = releaseFamily('vendor')
    expect(() => { family.validatePackedManifest(pkg, { name: pkg.name, version: pkg.version, dependencies: { '@supernova-ai/snh-tools': '^4.0.0' } }) })
      .not.toThrow()
    expect(() => { family.validatePackedManifest(pkg, { name: '@supernova-ai/other', version: pkg.version }) }).toThrow('packed identity')
    expect(() => { family.validatePackedManifest(pkg, { name: pkg.name, version: '0.0.2' }) }).toThrow('packed identity')
  })

  it('reports a runtime dependency cycle instead of emitting an arbitrary order', () => {
    const snh = releaseFamily('snh')
    const members = [
      member('packages/a/left', '@supernova-ai/snh-left', { dependencies: { '@supernova-ai/snh-right': 'workspace:^' } }),
      member('packages/a/right', '@supernova-ai/snh-right', { dependencies: { '@supernova-ai/snh-left': 'workspace:^' } }),
    ]

    expect(() => { snh.publishOrder(members) }).toThrow(/dependency cycle/)
  })

  it('publishes a peer before its consumer', () => {
    const snh = releaseFamily('snh')
    const members = [
      member('packages/a/consumer', '@supernova-ai/snh-consumer', { peerDependencies: { '@supernova-ai/snh-zebra': 'workspace:^' } }),
      member('packages/a/zebra', '@supernova-ai/snh-zebra'),
    ]

    // Name order alone would place the consumer first; the peer edge moves it.
    expect(snh.publishOrder(members).order.map(entry => entry.name)).toEqual([
      '@supernova-ai/snh-zebra',
      '@supernova-ai/snh-consumer',
    ])
  })

  it('orders around a peer cycle rather than refusing to publish, and reports the edge it dropped', () => {
    const snh = releaseFamily('snh')
    const members = [
      member('packages/a/left', '@supernova-ai/snh-left', { peerDependencies: { '@supernova-ai/snh-right': 'workspace:^' } }),
      member('packages/a/right', '@supernova-ai/snh-right', { peerDependencies: { '@supernova-ai/snh-left': 'workspace:^' } }),
    ]

    // Sibling packages declare each other as peers, and npm treats an unmet peer
    // as a warning, so this pair has to publish rather than fail the release.
    const plan = snh.publishOrder(members)
    expect(plan.order.map(entry => entry.name)).toEqual([
      '@supernova-ai/snh-right',
      '@supernova-ai/snh-left',
    ])
    // One of the two edges has to give, and which one it is belongs in the log.
    expect(plan.droppedPeerEdges).toEqual([
      { consumer: '@supernova-ai/snh-right', peer: '@supernova-ai/snh-left' },
    ])
  })

  it('honours an install edge even when a peer cycle surrounds it', () => {
    const snh = releaseFamily('snh')
    const members = [
      member('packages/a/base', '@supernova-ai/snh-base', { peerDependencies: { '@supernova-ai/snh-consumer': 'workspace:^' } }),
      member('packages/a/consumer', '@supernova-ai/snh-consumer', {
        dependencies: { '@supernova-ai/snh-base': 'workspace:^' },
        peerDependencies: { '@supernova-ai/snh-base': 'workspace:^' },
      }),
    ]

    // The install edge is absolute: base publishes first, and the peer edge that
    // would reverse it is the one dropped.
    const plan = snh.publishOrder(members)
    expect(plan.order.map(entry => entry.name)).toEqual([
      '@supernova-ai/snh-base',
      '@supernova-ai/snh-consumer',
    ])
    expect(plan.droppedPeerEdges).toEqual([
      { consumer: '@supernova-ai/snh-base', peer: '@supernova-ai/snh-consumer' },
    ])
  })

  it('refuses an order that would publish a consumer before a dependency it installs', () => {
    const snh = releaseFamily('snh')
    const members = [
      member('packages/a/alpha', '@supernova-ai/snh-alpha', { peerDependencies: { '@supernova-ai/snh-bravo': 'workspace:^' } }),
      member('packages/a/bravo', '@supernova-ai/snh-bravo', { peerDependencies: { '@supernova-ai/snh-charlie': 'workspace:^' } }),
      member('packages/a/charlie', '@supernova-ai/snh-charlie', { dependencies: { '@supernova-ai/snh-alpha': 'workspace:^' } }),
    ]

    // A cycle of two peer edges closed by one install edge: dropping a peer edge
    // would order this, and the traversal drops the install edge instead. That
    // order would publish charlie before the alpha it installs, so it is refused
    // here rather than published.
    expect(() => { snh.publishOrder(members) }).toThrow(/no publish order honours @supernova-ai\/snh-charlie -> @supernova-ai\/snh-alpha/)
  })

  it('ignores devDependencies when ordering', () => {
    const snh = releaseFamily('snh')
    const members = [
      member('packages/a/alpha', '@supernova-ai/snh-alpha', { devDependencies: { '@supernova-ai/snh-zebra': 'workspace:^' } }),
      member('packages/a/zebra', '@supernova-ai/snh-zebra'),
    ]

    // A dev dependency is absent from the published package, so it must not move
    // the consumer behind it.
    expect(snh.publishOrder(members).order.map(entry => entry.name)).toEqual([
      '@supernova-ai/snh-alpha',
      '@supernova-ai/snh-zebra',
    ])
  })

  it('accepts the harness payload and keeps upstream payloads for vendored packages', () => {
    const snh = releaseFamily('snh')
    const vendor = releaseFamily('vendor')
    const harness = member('packages/a/library', '@supernova-ai/snh-library')
    const vendored = member('vendor/cordis', '@supernova-ai/cordis')

    expect(() => { snh.validatePayload(harness, ['package/lib/index.js', 'package/lib/index.js.map', 'package/src/index.ts']) }).not.toThrow()
    expect(() => { vendor.validatePayload(vendored, ['package/lib/index.js', 'package/src/index.ts']) }).not.toThrow()
    expect(() => { vendor.validatePayload(vendored, []) }).toThrow(/empty tarball/)
  })

  it('requires the installed package payload the staging hook supplies', () => {
    const snh = releaseFamily('snh')
    const installed = member('apps/cli', '@supernova-ai/snh')

    expect(() => { snh.validatePayload(installed, ['package/lib/index.js', 'package/src/bin.ts']) })
      .toThrow(/@supernova-ai\/snh packed no documentation/)
    expect(() => { snh.validatePayload(installed, ['package/lib/index.js', 'package/docs/guide.md', 'package/src/bin.ts']) })
      .toThrow(/@supernova-ai\/snh packed no upgrade guide index/)
    const docs = ['package/docs/guide.md', 'package/docs/upgrade-guide/README.md']
    expect(() => { snh.validatePayload(installed, ['package/lib/index.js', ...docs]) })
      .toThrow(/@supernova-ai\/snh packed no source/)
    expect(() => { snh.validatePayload(installed, ['package/lib/index.js', ...docs, 'package/src/bin.ts']) })
      .not.toThrow()
  })

  it('drives the installed entry only for the family that publishes one', () => {
    expect(releaseFamily('snh').installedEntry).toEqual({ packageName: '@supernova-ai/snh', binPath: 'lib/bin.js' })
    expect(releaseFamily('vendor').installedEntry).toBeUndefined()
  })

  it('rejects an unknown family identifier', () => {
    expect(() => { releaseFamily('native') }).toThrow(/unknown release family/)
  })
})

describe('vendored version baseline', () => {
  it('drops an upstream prerelease segment and increments the patch', () => {
    expect(nextVendorVersion('4.0.0-rc.7', undefined)).toBe('4.0.1')
    expect(nextVendorVersion('1.0.0-rc.5', undefined)).toBe('1.0.1')
    expect(nextVendorVersion('1.8.1', undefined)).toBe('1.8.2')
  })

  it('increments from the last published version when a re-sync restored a lower one', () => {
    // Upstream moved rc.7 -> rc.8 after this repository published 4.0.1;
    // incrementing the manifest alone would name 4.0.1 a second time.
    expect(nextVendorVersion('4.0.0-rc.8', '4.0.1')).toBe('4.0.2')
    expect(nextVendorVersion('4.1.0', '4.0.1')).toBe('4.1.1')
  })

  it('appends a rehearsal prerelease without consuming its release numbers', () => {
    // A rehearsal burns 4.0.1-rc.1 and leaves 4.0.1 free, so the stable release
    // that follows takes those same numbers instead of skipping to 4.0.2.
    expect(nextVendorVersion('4.0.0-rc.7', undefined, 'rc.1')).toBe('4.0.1-rc.1')
    expect(nextVendorVersion('4.0.0-rc.7', '4.0.1-rc.1', 'rc.2')).toBe('4.0.1-rc.2')
    expect(nextVendorVersion('4.0.0-rc.7', '4.0.1-rc.1')).toBe('4.0.1')
    expect(nextVendorVersion('4.0.0-rc.7', '4.0.1')).toBe('4.0.2')
  })
})

describe('version precedence', () => {
  it('orders alpha, canary, and release-candidate versions by semver precedence', () => {
    expect(compareVersions('4.0.1-alpha.1', '4.0.1-canary.1')).toBeLessThan(0)
    expect(compareVersions('4.0.1-canary.1', '4.0.1-rc.1')).toBeLessThan(0)
    expect(compareVersions('4.0.1-rc.1', '4.0.1')).toBeLessThan(0)
  })

  it('ranks a release above the prerelease it follows', () => {
    // git --sort=v:refname disagrees, placing 4.0.1-rc.1 above 4.0.1, which is
    // why the newest published version is chosen here rather than by git.
    expect(compareVersions('4.0.1', '4.0.1-rc.1')).toBeGreaterThan(0)
    expect(compareVersions('4.0.1-rc.1', '4.0.1')).toBeLessThan(0)
  })

  it('compares numeric prerelease fields numerically', () => {
    expect(compareVersions('4.0.1-rc.10', '4.0.1-rc.1')).toBeGreaterThan(0)
    expect(compareVersions('4.0.1-rc.2', '4.0.1-rc.10')).toBeLessThan(0)
  })

  it('ranks a numeric field below an alphanumeric one, and a shorter list below a longer', () => {
    expect(compareVersions('4.0.1-1', '4.0.1-alpha')).toBeLessThan(0)
    expect(compareVersions('4.0.1-rc', '4.0.1-rc.1')).toBeLessThan(0)
    expect(compareVersions('4.0.2', '4.0.1')).toBeGreaterThan(0)
    expect(compareVersions('4.0.1-rc.1', '4.0.1-rc.1')).toBe(0)
  })
})

describe('payload change judgement', () => {
  const sourceShipping = member('vendor/cosmokit', '@supernova-ai/cosmokit', {
    files: ['lib/index.js', 'lib/types/**/*.d.ts', 'src'],
  })
  const buildOutputOnly = member('vendor/cordis', '@supernova-ai/cordis', {
    files: ['lib/index.js', 'lib/types/**/*.d.ts', 'bin.js'],
  })

  it('counts the manifest and the files npm always publishes', () => {
    expect(reachesPayload(sourceShipping, 'vendor/cosmokit/package.json')).toBe(true)
    expect(reachesPayload(sourceShipping, 'vendor/cosmokit/README.md')).toBe(true)
    expect(reachesPayload(sourceShipping, 'vendor/cosmokit/src/index.ts')).toBe(true)
  })

  it('counts build inputs for a package whose payload is build output', () => {
    // cordis publishes lib/ only, and lib/ is not tracked: without this, a real
    // source change reads as "nothing changed" and the next publish fails on a
    // version whose bytes moved.
    expect(reachesPayload(buildOutputOnly, 'vendor/cordis/src/context.ts')).toBe(true)
    expect(reachesPayload(buildOutputOnly, 'vendor/cordis/tsconfig.json')).toBe(true)
  })

  it('ignores paths no tarball carries', () => {
    expect(reachesPayload(sourceShipping, 'vendor/cosmokit/tests/unit.spec.ts')).toBe(false)
    expect(reachesPayload(sourceShipping, 'vendor/cosmokit/CHANGELOG.md')).toBe(false)
    // The README pattern is deliberately loose: over-reporting a change costs one
    // unnecessary patch bump, while under-reporting fails the next publish on a
    // version whose bytes moved.
    expect(reachesPayload(sourceShipping, 'vendor/cosmokit/README.i18n.yaml')).toBe(true)
    expect(reachesPayload(member('packages/a/library', '@supernova-ai/snh-library', { files: ['lib/index.js'] }),
      'packages/a/library/tests/library.spec.ts')).toBe(false)
  })
})
