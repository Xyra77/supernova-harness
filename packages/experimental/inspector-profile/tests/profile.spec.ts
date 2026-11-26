/** The optional Developer Tools bundle enables both inspectors, including fetch capture. */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseEntryYaml } from '@supernova-ai/cordis-plugin-include'

describe('Inspector profile bundle', () => {
  it('publishes one layer containing both inspectors and the Statistics view', () => {
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
      publishConfig: { access: string }
      snh: { bundle: { patch: string } }
      dependencies: Record<string, string>
    }
    expect(manifest.publishConfig.access).toBe('public')
    expect(manifest.snh.bundle.patch).toBe('./cordis.patch.yml')
    expect(manifest.dependencies).toEqual({
      '@supernova-ai/snh-experimental-client-ui-stats': 'workspace:*',
      '@supernova-ai/snh-experimental-inspector': 'workspace:*',
      '@supernova-ai/snh-experimental-session-inspector': 'workspace:*',
    })
    expect(parseEntryYaml(readFileSync(new URL(`../${manifest.snh.bundle.patch}`, import.meta.url), 'utf8'))).toEqual([{ insert: [
      {
        id: 'experimental-inspector', name: '@supernova-ai/snh-experimental-inspector',
        disabled: false, config: { captureFetch: true },
      },
      { id: 'session-inspector', name: '@supernova-ai/snh-experimental-session-inspector' },
      { id: 'client-ui-stats', name: '@supernova-ai/snh-experimental-client-ui-stats' },
    ] }])
  })
})
