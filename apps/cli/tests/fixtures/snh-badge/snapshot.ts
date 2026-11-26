import { executeToolFixture } from '@supernova-ai/snh-tool-testkit'
import { fileURLToPath } from 'node:url'
import { agentEvents, type Agent } from '@supernova-ai/snh-agent'
import { brandString } from '@supernova-ai/snh-brand'
import type { ToolCallId } from '@supernova-ai/snh-llm'
import { boot, loadOverlayPatches } from '@supernova-ai/snh-app-boot'
import type { SessionId } from '@supernova-ai/snh-session'
import type {} from '@supernova-ai/snh-skill'
import type {} from '@supernova-ai/snh-tools'
import { unsupportedModel, unsupportedInbox } from '@supernova-ai/snh-agent-loop-testkit'

const overlayPath = process.argv[2]
if (overlayPath === undefined) throw new Error('snh-badge snapshot requires an overlay path')
const rootConfigPath = fileURLToPath(new URL('../../../../../packages/bundle/base/tests/fixtures/root.cordis.yml', import.meta.url))
const basePatchPath = fileURLToPath(new URL('../../../../../packages/bundle/base/cordis.patch.yml', import.meta.url))
// The fixture owns the optional provider; the base bundle has no dependency on it.
const overlays = loadOverlayPatches('snh-badge-snapshot', overlayPath).map(patch => patch.insert === undefined ? patch : {
  ...patch,
  insert: patch.insert.map(row => row.name === '@supernova-ai/snh-skill-badge'
    ? { ...row, name: import.meta.resolve('@supernova-ai/snh-skill-badge') }
    : row),
})
const ctx = await boot('snh-badge-snapshot', rootConfigPath, [
  ...loadOverlayPatches('snh-badge-snapshot', basePatchPath),
  ...overlays,
])

try {
  const agentId = brandString<SessionId>('snh-badge-snapshot')
  const session = ctx.sessions.create(agentId, { meta: { cwd: process.cwd() } })
  const agent: Agent = {
    ctx,
    id: agentId,
    options: {},
    session,
    model: unsupportedModel(),
    inbox: unsupportedInbox(),
    status: 'idle',
    send: () => {},
    followup: () => {},
    steer: () => {},
    inject: () => { throw new Error('snh-badge snapshot must receive the catalog at the step boundary') },
    cancel: () => {},
    runMaintenance: job => job(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
  const decision = await agentEvents(ctx, agent).waterfall(
    'agent/pre-step',
    { modelSelection: { provider: 'mock', model: 'mock' }, messages: [], turn: 1, step: 1, signal: new AbortController().signal },
    () => Promise.resolve({ kind: 'enter' as const, messages: [] }),
  )
  const catalog = decision.kind === 'enter'
    ? decision.messages.find(message => message.role === 'user'
      && message.source.kind === 'skill-catalog')?.content
    : undefined
  const summary = (await ctx.skills.list()).find(skill => skill.name === 'snh-badge')
  const result = await executeToolFixture(ctx, {
    callId: brandString<ToolCallId>('snh-badge-snapshot'),
    name: 'skill',
    arguments: { name: 'snh-badge' },
    signal: new AbortController().signal,
  })
  process.stdout.write(`${JSON.stringify({ catalog: catalog ?? null, summary: summary ?? null, result })}\n`)
} finally {
  await ctx.fiber.dispose()
}
