import { describe, expect, it } from 'vitest'
import { brandString } from '@supernova-ai/snh-brand'
import { builtinCommandName, builtinCommandTokens, resolveCommand } from '../src/builtin.ts'
import type { CommandDefinitionId, CommandDescriptor } from '../src/types.ts'

const definitions = [
  ['goal', '@supernova-ai/snh-command-goal'],
  ['plan', '@supernova-ai/snh-plan-mode'],
  ['feedback', '@supernova-ai/snh-command-feedback'],
  ['compact', '@supernova-ai/snh-command-compact'],
  ['permission', '@supernova-ai/snh-permission-presets'],
  ['export', '@supernova-ai/snh-session-log-export'],
] as const

describe('builtin command resolution', () => {
  it.each(definitions)('follows the %s identity through canonical, Chinese and renamed input', (name, id) => {
    const descriptor: CommandDescriptor = {
      name: `renamed-${name}`, definitionId: brandString<CommandDefinitionId>(id), description: 'Renamed command',
    }
    expect(builtinCommandName(descriptor)).toBe(name)
    for (const token of [builtinCommandTokens.en[name], builtinCommandTokens.zh[name], descriptor.name]) {
      expect(resolveCommand(token, [descriptor])).toBe(descriptor)
    }
  })

  it('retains exact-name priority without assigning builtin identity to the replacement', () => {
    const builtin: CommandDescriptor = {
      name: 'planning', definitionId: brandString<CommandDefinitionId>('@supernova-ai/snh-plan-mode'), description: 'Plan',
    }
    const replacement: CommandDescriptor = {
      name: 'plan', definitionId: brandString<CommandDefinitionId>('example/plan'), description: 'Other command',
    }
    expect(resolveCommand('plan', [builtin, replacement])).toBe(replacement)
    expect(builtinCommandName(replacement)).toBeUndefined()
    expect(resolveCommand('计划', [builtin, replacement])).toBe(builtin)
    expect(resolveCommand('missing', [builtin])).toBeUndefined()
    expect(resolveCommand('plan', [])).toBeUndefined()
  })
})
