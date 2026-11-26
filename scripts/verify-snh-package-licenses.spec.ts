import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { inspectSnhPackageLicenses } from './verify-snh-package-licenses.ts'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function writeManifest(root: string, file: string, manifest: Record<string, unknown>): void {
  const path = join(root, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

function createWorkspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'snh-package-licenses-'))
  roots.push(root)
  writeManifest(root, 'package.json', {
    name: '@supernova-ai/snh-root',
    license: 'MIT',
    workspaces: ['apps/*', 'packages/*/*', 'vendor/*'],
  })
  return root
}

describe('SNH package license gate', () => {
  it('checks root, unhyphenated CLI, and snh-prefixed package names while ignoring other families', () => {
    const root = createWorkspace()
    writeManifest(root, 'apps/cli/package.json', { name: '@supernova-ai/snh', license: 'MIT' })
    writeManifest(root, 'packages/core/agent/package.json', {
      name: '@supernova-ai/snh-agent',
      license: 'BSD-3-Clause',
    })
    writeManifest(root, 'vendor/cordis/package.json', {
      name: '@supernova-ai/cordis',
      license: 'BSD-3-Clause',
    })

    expect(inspectSnhPackageLicenses(root)).toEqual({
      packageCount: 3,
      failures: [
        'packages/core/agent/package.json: @supernova-ai/snh-agent must declare "license": "MIT"; found "BSD-3-Clause".',
      ],
    })
  })

  it('rejects a missing license declaration', () => {
    const root = createWorkspace()
    writeManifest(root, 'packages/core/agent/package.json', { name: '@supernova-ai/snh-agent' })

    expect(inspectSnhPackageLicenses(root).failures).toEqual([
      'packages/core/agent/package.json: @supernova-ai/snh-agent must declare "license": "MIT"; found undefined.',
    ])
  })
})
