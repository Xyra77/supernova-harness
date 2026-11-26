import { mountWorkingDirectoryFixture } from '../../subagent/tests/working-directory-fixture.ts'
import { join } from 'node:path'
import * as JsonlSessionPersistence from '@supernova-ai/snh-session-persistence-jsonl'
import { Context } from '@supernova-ai/cordis'
import type { Agent } from '@supernova-ai/snh-agent'
import AgentLoop from '@supernova-ai/snh-agent-loop'
import { mountAgentLoopTestDependencies } from '@supernova-ai/snh-agent-loop-testkit'
import { LocalBashExecutor } from '@supernova-ai/snh-bash-local'
import * as BashEnvPlugin from '@supernova-ai/snh-shell-env'
import LocalSubprocessRuntime from '@supernova-ai/snh-subprocess-local'
import * as ToolBash from '@supernova-ai/snh-tool-bash'
import * as LlmSuperNova from '@supernova-ai/snh-llm-supernova-api-key'
import SubagentRuntime from '@supernova-ai/snh-subagent'
import * as Spawn from '../src/index.ts'
import SuperNovaAuth from '@supernova-ai/snh-supernova-auth'
import * as ToolSubagent from '@supernova-ai/snh-tool-subagent'

/**
 * Shared harness for the spawn-backend e2e: the full real stack (SuperNova
 * adapter + real bash tool + the subagent tool bound to the spawn backend), so
 * a real parent agent can delegate to a real in-process child that does real
 * work (writes a file). Lives outside the *.e2e.ts pattern so importing it never
 * re-registers another file's tests.
 */
export async function spawnHarness(workdir: string): Promise<Context> {
  const ctx = new Context()
  // This harness installs only the global default persona, so both parent and
  // spawned children render it. It stays neutral for both roles; the
  // delegation nudge lives in the e2e's user prompt and the subagent tool's
  // own description.
  await mountAgentLoopTestDependencies(ctx, {
    workingDirectory: true,
    systemPrompt: { personaPrefix: 'You are a coding agent. Report only when the requested work is done.' },
  })
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SuperNovaAuth)
  await ctx.plugin(LlmSuperNova)
  await ctx.plugin(LocalSubprocessRuntime)
  await ctx.plugin(BashEnvPlugin)
  await ctx.plugin(LocalBashExecutor, { cwd: workdir, timeoutMs: 30_000 })
  await ctx.plugin(ToolBash)
  await ctx.plugin(JsonlSessionPersistence, { root: join(workdir, '.sessions') })
  await mountWorkingDirectoryFixture(ctx)
  await ctx.plugin(SubagentRuntime)
  await ctx.plugin(Spawn, { providerName: 'spawn' })
  // The model-facing subagent tool, bound to the spawn backend.
  await ctx.plugin(ToolSubagent, { provider: 'spawn' })
  return ctx
}

export async function waitForIdle(ctx: Context, agent: Agent): Promise<void> {
  do {
    await agent.whenIdle()
  } while (await ctx.subagents.waitForTreeWork(agent))
}
