import { describe, expect, it } from 'vitest'
import type { NpmPackageLock, RegistryIndex } from './benchmark-npm-resolution.ts'
import {
  assertDualSnhInstallLayout,
  assertResolutionWorkBudget,
  buildDualSnhRegistry,
  MAX_RESOLUTION_WORK_UNITS,
} from './verify-npm-install-layout.ts'

function validLayout(): NpmPackageLock {
  return {
    lockfileVersion: 3,
    packages: {
      '': { dependencies: { '@supernova-ai/snh': '0.2.0', 'snh-previous': 'npm:@supernova-ai/snh@0.1.0' } },
      'node_modules/@supernova-ai/cordis': { version: '4.0.1' },
      'node_modules/@supernova-ai/snh': {
        version: '0.2.0',
        dependencies: { '@supernova-ai/snh-child': '^0.2.0' },
        peerDependencies: { '@supernova-ai/cordis': '^4.0.1' },
      },
      'node_modules/@supernova-ai/snh-child': {
        version: '0.2.0',
        dependencies: { '@supernova-ai/snh-leaf': '^0.2.0' },
      },
      'node_modules/@supernova-ai/snh-leaf': { version: '0.2.0' },
      'node_modules/snh-previous': {
        name: '@supernova-ai/snh',
        version: '0.1.0',
        dependencies: { '@supernova-ai/snh-child': '^0.1.0' },
        peerDependencies: { '@supernova-ai/cordis': '^4.0.1' },
      },
      'node_modules/snh-previous/node_modules/@supernova-ai/snh-child': {
        version: '0.1.0',
        dependencies: { '@supernova-ai/snh-leaf': '^0.1.0' },
      },
      'node_modules/snh-previous/node_modules/@supernova-ai/snh-leaf': { version: '0.1.0' },
    },
  }
}

describe('npm install layout verifier', () => {
  it('creates two incompatible versions of every SNH package', () => {
    const index: RegistryIndex = new Map([
      ['@supernova-ai/snh', new Map([['0.1.1-rc.2', {
        name: '@supernova-ai/snh',
        version: '0.1.1-rc.2',
        dependencies: { '@supernova-ai/snh-child': '^0.1.1-rc.2' },
        peerDependencies: { '@supernova-ai/cordis': '^4.0.1' },
      }]])],
      ['@supernova-ai/snh-child', new Map([['0.1.1-rc.2', {
        name: '@supernova-ai/snh-child',
        version: '0.1.1-rc.2',
      }]])],
      ['@supernova-ai/cordis', new Map([['4.0.1', {
        name: '@supernova-ai/cordis',
        version: '4.0.1',
      }]])],
    ])

    const dual = buildDualSnhRegistry(index, '0.1.1-rc.2')

    expect([...dual.get('@supernova-ai/snh')?.keys() ?? []]).toEqual(['0.1.0', '0.2.0'])
    expect(dual.get('@supernova-ai/snh')?.get('0.1.0')).toMatchObject({
      version: '0.1.0',
      dependencies: { '@supernova-ai/snh-child': '^0.1.0' },
      peerDependencies: { '@supernova-ai/cordis': '^4.0.1' },
    })
    expect(dual.get('@supernova-ai/snh')?.get('0.2.0')).toMatchObject({
      version: '0.2.0',
      dependencies: { '@supernova-ai/snh-child': '^0.2.0' },
    })
    expect(dual.get('@supernova-ai/cordis')).toBe(index.get('@supernova-ai/cordis'))
  })

  it('accepts isolated SNH releases with one shared Cordis installation', () => {
    expect(assertDualSnhInstallLayout(validLayout())).toEqual({
      snhPackagesPerVersion: 3,
      checkedSnhEdges: 4,
    })
  })

  it.each([
    ['react', 'node_modules/react'],
    ['react-dom', 'node_modules/react-dom'],
    ['react', 'node_modules/snh-previous/node_modules/react'],
    ['react-dom', 'node_modules/snh-previous/node_modules/react-dom'],
  ])('rejects browser runtime %s installed at %s in the SNH-only consumer', (name, path) => {
    const layout = validLayout()
    const packages = { ...layout.packages, [path]: { version: '18.3.1' } }
    expect(() => assertDualSnhInstallLayout({ ...layout, packages })).toThrow(
      `${path}: ${name} is a browser build input`,
    )
  })

  it('rejects an internal edge that crosses release versions', () => {
    const layout = validLayout()
    const packages = { ...layout.packages }
    Reflect.deleteProperty(packages, 'node_modules/snh-previous/node_modules/@supernova-ai/snh-leaf')

    expect(() => assertDualSnhInstallLayout({ ...layout, packages })).toThrow(
      'node_modules/snh-previous/node_modules/@supernova-ai/snh-child: dependencies '
      + '@supernova-ai/snh-leaf resolves to node_modules/@supernova-ai/snh-leaf@0.2.0, expected 0.1.0',
    )
  })

  it('rejects a second Cordis installation', () => {
    const layout = validLayout()
    const packages = {
      ...layout.packages,
      'node_modules/snh-previous/node_modules/@supernova-ai/cordis': { version: '4.0.1' },
    }

    expect(() => assertDualSnhInstallLayout({ ...layout, packages })).toThrow(
      'expected one shared @supernova-ai/cordis',
    )
  })
})

describe('resolution work budget', () => {
  it.each([
    [277, 2524, 699_148],
    [316, 2780, 878_480],
    [316, 2786, 880_376],
    [317, 2786, 883_162],
    [320, 2836, 907_520],
  ])('accepts the measured dual-release graph with %i packages and %i edges', (packages, edges, units) => {
    expect(assertResolutionWorkBudget({ snhPackagesPerVersion: packages, checkedSnhEdges: edges }))
      .toBe(units)
  })

  it('accepts a graph exactly at the budget and rejects one internal edge above it', () => {
    const packages = 320
    const edgesAtBudget = Math.floor(MAX_RESOLUTION_WORK_UNITS / packages)

    expect(packages * edgesAtBudget).toBe(MAX_RESOLUTION_WORK_UNITS)
    expect(assertResolutionWorkBudget({ snhPackagesPerVersion: packages, checkedSnhEdges: edgesAtBudget }))
      .toBe(MAX_RESOLUTION_WORK_UNITS)
    expect(() => assertResolutionWorkBudget({
      snhPackagesPerVersion: packages,
      checkedSnhEdges: edgesAtBudget + 1,
    })).toThrow(`= ${String(MAX_RESOLUTION_WORK_UNITS + packages)} unit(s), budget ${String(MAX_RESOLUTION_WORK_UNITS)} unit(s)`)
  })

  it('accepts the headroom and rejects a runaway graph with its own measured counts', () => {
    expect(assertResolutionWorkBudget({ snhPackagesPerVersion: 350, checkedSnhEdges: 3200 }))
      .toBe(1_120_000)
    expect(() => assertResolutionWorkBudget({ snhPackagesPerVersion: 400, checkedSnhEdges: 3000 }))
      .toThrow(`400 package(s) per release x 3000 internal edge(s) = 1200000 unit(s), budget ${String(MAX_RESOLUTION_WORK_UNITS)} unit(s)`)
  })
})
