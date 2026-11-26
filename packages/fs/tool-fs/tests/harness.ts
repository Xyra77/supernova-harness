import { Context } from '@supernova-ai/cordis'
import WorkingDirectory from '@supernova-ai/snh-working-directory'
import type { Agent } from '@supernova-ai/snh-agent'
import AgentLoop from '@supernova-ai/snh-agent-loop'
import { mountAgentLoopTestDependencies } from '@supernova-ai/snh-agent-loop-testkit'
import LocalFileSystem from '@supernova-ai/snh-fs-local'
import * as FsPolicy from '@supernova-ai/snh-fs-observation-policy'
import * as ToolFs from '@supernova-ai/snh-tool-fs'
import * as LlmSuperNova from '@supernova-ai/snh-llm-supernova-api-key'
import SuperNovaAuth from '@supernova-ai/snh-supernova-auth'

/**
 * Build the real fs-tool stack for with-key e2e tests. Agents have no session
 * cwd, so `fsCwd` is their workspace; `persona` configures the deployment prompt.
 * This helper lives outside the e2e glob so imports do not register tests.
 */
export async function fsHarness(fsCwd: string, persona = ''): Promise<Context> {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx, { systemPrompt: { personaPrefix: persona } })
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SuperNovaAuth)
  await ctx.plugin(LlmSuperNova)
  await ctx.plugin(LocalFileSystem, { cwd: fsCwd })
  await ctx.plugin(WorkingDirectory, { defaultDirectory: fsCwd })
  await ctx.plugin(FsPolicy)
  await ctx.plugin(ToolFs)
  return ctx
}

export function waitForIdle(ctx: Context, agent: Agent): Promise<void> {
  return new Promise((resolve) => {
    const dispose = ctx.on('agent/status', ({ agent: subject, status }) => {
      if (subject === agent && status === 'idle') {
        dispose()
        resolve()
      }
    })
  })
}
