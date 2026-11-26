/** Real Loader composition of the card service and this kind with a scripted model, package installation and HMR. */
import { mkdtemp, mkdir, writeFile, readFile, rename, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import type { Context } from '@supernova-ai/cordis'
import Timer from '@supernova-ai/cordis-plugin-timer'
import { boot, initProfile, loadProfileDirectory, readProfilePatches, readProfileManifest, type ProfileContext } from '@supernova-ai/snh-app-boot'
import Hmr from '@supernova-ai/snh-hmr'
import PluginManager from '@supernova-ai/snh-plugin-manager'
import Sessions, { type SessionId } from '@supernova-ai/snh-session'
import Projections from '@supernova-ai/snh-session-projection'
import Agents from '@supernova-ai/snh-agent'
import AgentLoop from '@supernova-ai/snh-agent-loop'
import { brandString } from '@supernova-ai/snh-brand'
import Llm, { createUserMessage } from '@supernova-ai/snh-llm'
import Skills from '@supernova-ai/snh-skill'
import * as SkillTool from '@supernova-ai/snh-tool-skill'
import SystemPrompt from '@supernova-ai/snh-system-prompt'
import Tools from '@supernova-ai/snh-tools'
import * as NativeExecutor from '@supernova-ai/snh-tool-executor-native'
import FsLocal from '@supernova-ai/snh-fs-local'
import WorkingDirectory from '@supernova-ai/snh-working-directory'
import Access from '@supernova-ai/snh-api-remote-access'
import * as ActionCards from '@supernova-ai/snh-action-cards'
import type { SubagentActivation, SubagentActivationSpec } from '@supernova-ai/snh-subagent'
import { MockAdapter, textResponse, toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import * as Recommendations from '../src/index.ts'
import { writeBundle } from './fixture.ts'

it.each(['portable-bundle', 'foreign-nested-row'] as const)('validates and installs through pnpm/HMR: %s', async (scenario) => {
  const home = await mkdtemp(join(tmpdir(), 'snh-creation-loader-'))
  let owner: Context | undefined
  onTestFinished(async () => { await owner?.fiber.dispose(); await rm(home, { recursive: true, force: true }) })
  const dir = join(home, 'profiles', 'test')
  const base = join(home, 'fixture-base')
  const anchor = join(home, 'package.json')
  await mkdir(base)
  await writeFile(anchor, JSON.stringify({ name: 'installation', dependencies: {} }))
  await writeFile(join(base, 'package.json'), JSON.stringify({ name: 'fixture-base', version: '1.0.0',
    snh: { bundle: { patch: './cordis.patch.yml' } } }))
  await writeFile(join(base, 'cordis.patch.yml'), JSON.stringify([{ insert: [
    ['session', 'sessions'], ['projection', 'projections'], ['llm', 'llm'], ['prompt', 'prompt'], ['tools', 'tools'],
    ['executor', 'executor'], ['fs', 'fs'], ['working-directory', 'workingDirectory'], ['skills', 'skills'], ['tool-skill', 'toolSkill'],
    ['agents', 'agents'], ['access', 'access'], ['manager', 'manager'], ['action-cards', 'actionCards'], ['recommendations', 'recommendations'],
  ].map(([id, name]) => ({ id, name: 'cordis:' + name! })) }]))
  initProfile(dir, ['fixture-base'])
  const manifestPath = join(dir, 'package.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, unknown>
  await writeFile(manifestPath, JSON.stringify({ ...manifest, dependencies: { 'fixture-base': 'file:' + base } }))
  await mkdir(join(dir, 'node_modules'))
  await symlink(base, join(dir, 'node_modules', 'fixture-base'), 'junction')
  await writeFile(join(dir, 'cordis.yml'), '[]\n')
  const profile: ProfileContext = {
    name: 'test', dir, home, cwd: home, patchPath: join(dir, 'cordis.patch.yml'), installAnchor: anchor,
    startedBundles: loadProfileDirectory('test', dir, anchor).layers.map(layer => layer.packageName),
    overlayPaths: [], telemetryDisabledEnv: undefined,
  }
  const starts: SubagentActivationSpec[] = []
  const ctx = await boot('test', join(dir, 'cordis.yml'), readProfilePatches('test', profile), (ctx) => {
    owner = ctx
    ctx.provide('profileContext', profile)
    ctx.provide('appReady', { onReady: (listener) => { listener(); return () => {} } })
    ctx.provide('subagents', { startActivation: async (spec: SubagentActivationSpec): Promise<SubagentActivation & { childId: SessionId }> => {
      starts.push(spec)
      const instructions = JSON.parse(spec.prompt.find(block => block.type === 'text')!.text) as { packageName: string }
      await writeBundle(spec.cwd!, instructions.packageName)
      if (scenario === 'foreign-nested-row') {
        await writeFile(join(spec.cwd!, 'cordis.patch.yml'), JSON.stringify([{ insert: [{
          id: instructions.packageName + ':group', name: instructions.packageName, group: true,
          config: [{ id: 'access', name: instructions.packageName }],
        }] }]))
      } else {
        await rename(join(spec.cwd!, 'index.js'), join(spec.cwd!, 'runtime.mjs'))
        await symlink('./runtime.mjs', join(spec.cwd!, 'index.js'))
      }
      return { childId: spec.childId!, name: 'agent-1', dispose: async () => {},
        result: Promise.resolve({ output: [], stopReason: 'completed', structured: { ready: true } }) }
    } })
    Object.assign(ctx.loader.builtins, { sessions: Sessions, projections: Projections, llm: Llm, prompt: SystemPrompt, tools: Tools,
      executor: NativeExecutor, fs: FsLocal, workingDirectory: WorkingDirectory, skills: Skills, toolSkill: SkillTool, agents: Agents,
      access: Access, manager: PluginManager, actionCards: ActionCards, recommendations: Recommendations })
  })
  await ctx.plugin(Timer)
  await ctx.plugin(Hmr, { root: [], ignored: [], debounce: 0 })
  await ctx.hmr.runExclusive(async () => {})
  await ctx.plugin(AgentLoop, { agents: [] })
  const block = JSON.stringify({ action: 'create_personalized_page', title: 'Counter',
    brief: 'Keep a counter in the right sidebar.', details: { slot: 'sidebar-right' } })
  const adapter = new MockAdapter([
    toolCallResponse('call-skill', 'skill', { name: 'personalized-pages' }),
    textResponse(`After you click Create below, I will build it in the background.\n\n\`\`\`action-card\n${block}\n\`\`\`\n`),
  ])
  ctx.llm.registerAdapter(['mock'], adapter)
  const agent = await ctx.agentLoop.create(brandString<SessionId>('creation-live'), { provider: 'mock', model: 'mock' }, { cwd: home })
  agent.followup(createUserMessage({ content: [{ type: 'text', text: 'I want a counter that stays visible.' }], source: { kind: 'user' } }))
  await vi.waitFor(() => { expect(agent.session.snapshotEvents().some(event => event.type === 'turn/end')).toBe(true) })
  // The card comes from the block that ends the answer; no request declares a card tool.
  expect(adapter.requests.flatMap(request => (request.tools ?? []).map(tool => tool.name))).not.toContain('propose_action')
  const results = agent.session.snapshotEvents().flatMap(event => event.type === 'tool/result' ? [event.data.message] : [])
  expect(results.map(message => message.isError === true)).toEqual([false])
  const proposals = Object.values(ctx.actionCards.view(agent.session).proposals)
  expect(proposals).toMatchObject([{ action: 'create_personalized_page', title: 'Counter' }])
  const cardId = proposals[0]!.cardId
  const receipt = () => ctx.actionCards.view(agent.session).decisions[cardId]
  expect(starts).toHaveLength(0)
  const access = [...ctx.loader.entries()].find(entry => entry.options.id === 'access')
  expect(await ctx.actionCards.act(agent, cardId, 'create', { slot: 'page' })).toEqual({ status: 'accepted' })
  if (scenario === 'foreign-nested-row') {
    await vi.waitFor(() => { expect(receipt()?.phase).toBe('failed') })
    expect([...ctx.loader.entries()].find(entry => entry.options.id === 'access')).toBe(access)
    expect(access?.options.name).toBe('cordis:access')
    expect(access?.fiber).toBeDefined()
    expect(readProfileManifest('test', dir).snh?.profile?.bundles).toEqual(['fixture-base'])
    return
  }
  await vi.waitFor(() => { expect(receipt()?.phase).toBe('installed') }, { timeout: 20_000 })
  expect(receipt()?.data?.application).toBe('applied')
  expect(starts[0]?.agentPreset).toBe('cordis')
  expect(starts[0]?.cwd?.startsWith(join(home, '.snh-created-plugins'))).toBe(true)
  await rm(starts[0]!.cwd!, { recursive: true })
  const name = receipt()?.data?.bundleName
  if (typeof name !== 'string') throw new Error('the installed card records no bundle name')
  await ctx.pluginManager.setBundleEnabled(name, false)
  expect((await ctx.pluginManager.setBundleEnabled(name, true)).application).toBe('applied')
  const live = () => [...ctx.loader.entries()].find(entry => entry.options.id === name + ':counter')?.fiber
  expect(live()).toBeDefined()
  expect(readProfileManifest('test', dir).snh?.profile?.bundles).toContain(name)
  await ctx.actionCards.act(agent, cardId, 'undo')
  expect(receipt()?.phase).toBe('removed')
  expect(live()).toBeUndefined()
  expect(readProfileManifest('test', dir).snh?.profile?.bundles).toEqual(['fixture-base'])
  expect((await ctx.pluginManager.listBundles()).find(bundle => bundle.name === name)?.installed).not.toBe(true)
  const feature = [...ctx.loader.entries()].find(entry => entry.options.id === 'recommendations')
  expect(feature?.fiber).toBeDefined()
  await feature!.fiber!.dispose()
  expect(await ctx.skills.list()).toEqual([])
  expect(await ctx.actionCards.act(agent, cardId, 'restore')).toEqual({ status: 'refused', reason: 'unavailable' })
}, 30_000)
