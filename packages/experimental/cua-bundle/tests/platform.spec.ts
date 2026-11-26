/** Explicit patch overlays bypass bundle admission and must not import an absent native provider. */
import { readFile } from 'node:fs/promises'
import { Context } from '@supernova-ai/cordis'
import Loader, { interpolate, type EntryOptions } from '@supernova-ai/cordis-plugin-loader'
import { parseEntryYaml } from '@supernova-ai/cordis-plugin-include'
import { expect, it, vi } from 'vitest'

it.each(['darwin', 'win32', 'linux'])('loads the exported patch directly on %s and selects its native provider', async (platform) => {
  const patch = parseEntryYaml(await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')) as { insert: EntryOptions[] }[]
  for (const id of ['cua-macos', 'cua-windows']) {
    expect(patch[0]!.insert.find(row => row.id === id)?.name).toBe(`@supernova-ai/snh-${id}`)
  }
  const ctx = new Context()
  await ctx.plugin(Loader)
  if (!ctx.loader.internal) throw new Error('Loader module importer is unavailable')
  const imported = vi.spyOn(ctx.loader.internal, 'import').mockImplementation(async (name: string) => {
    if (platform !== 'darwin' && name === '@supernova-ai/snh-cua-macos') {
      throw new Error('native provider is absent from this installation')
    }
    return { name, apply: () => {} }
  })
  try {
    for (const row of patch[0]!.insert) {
      await ctx.loader.create({ ...row, disabled: Boolean(interpolate({ process: { platform } }, row.disabled)) })
    }
    await ctx.loader.await()
    const imports = imported.mock.calls.map(call => call[0])
    expect(imports).toContain('@supernova-ai/snh-cua')
    expect(imports).toContain('@supernova-ai/snh-computer-use')
    expect(imports.includes('@supernova-ai/snh-cua-macos')).toBe(platform === 'darwin')
    expect(imports.includes('@supernova-ai/snh-cua-windows')).toBe(platform === 'win32')
  } finally {
    await ctx.fiber.dispose()
    imported.mockRestore()
  }
})
