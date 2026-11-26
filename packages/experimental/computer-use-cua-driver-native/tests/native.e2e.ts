/** Opt-in native SDK compatibility check without screenshots, input, or permission prompts. */
import SessionProjectionRegistry from '@supernova-ai/snh-session-projection'
import { executeToolFixture } from '@supernova-ai/snh-tool-testkit'

import * as NativeToolExecutor from '@supernova-ai/snh-tool-executor-native'
import { expect, it } from 'vitest'
import { Context } from '@supernova-ai/cordis'
import ComputerUseRegistry from '@supernova-ai/snh-computer-use'
import { brandString } from '@supernova-ai/snh-brand'
import type { ToolCallId } from '@supernova-ai/snh-llm'
import SystemPrompt from '@supernova-ai/snh-system-prompt'
import ToolRuntime from '@supernova-ai/snh-tools'
import * as NativeProvider from '../src/index.ts'

it.skipIf(process.env.SNH_COMPUTER_USE_NATIVE_E2E !== '1')(
  'loads the installed native SDK, reads permission status without prompting, and shuts down',
  { retry: 0 },
  async ({ signal }) => {
    const ctx = new Context()
    try {
      await ctx.plugin(ComputerUseRegistry)
      await ctx.plugin(SessionProjectionRegistry)
      await ctx.plugin(SystemPrompt)
      await ctx.plugin(ToolRuntime)
      await ctx.plugin(NativeToolExecutor)
      const provider = ctx.plugin(NativeProvider)
      await provider
      expect(ctx.computerUse.providerName).toBe('cua-driver-native')
      const names = ctx.tools.schemas().map(tool => tool.name)
      expect(names).toContain('cua_driver_native__check_permissions')
      expect(names).toContain('cua_driver_native__get_window_state')
      expect(names.every(name => name.startsWith('cua_driver_native__'))).toBe(true)

      const result = await executeToolFixture(ctx, {
        name: 'cua_driver_native__check_permissions',
        callId: brandString<ToolCallId>('native-live-permissions'),
        arguments: { prompt: false },
        signal,
      })
      expect(result.isError).toBe(false)
      if (result.isError) throw new Error('Native permission-status call failed')
      if (result.value === null || typeof result.value !== 'object' || Array.isArray(result.value)) {
        throw new Error('Native permission status did not return an MCP result object')
      }
      expect(Array.isArray(result.value.content)).toBe(true)
      expect(result.content.some(block => block.type === 'text')).toBe(true)
      expect(result.content.some(block => block.type === 'image')).toBe(false)

      await provider.dispose()
      expect(ctx.tools.schemas()).toEqual([])
      expect(ctx.computerUse.providerName).toBeUndefined()
    } finally {
      await ctx.fiber.dispose()
    }
  },
)
