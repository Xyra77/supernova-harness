/** Official SuperNova Harness occupants: the Supernova home effect and the symbol-only brand marks. */
import type { Context as ClientContext } from '@supernova-ai/cordis'
import type {} from '@supernova-ai/snh-client-ui-renderer/client'
import type {} from '@supernova-ai/snh-client-ui-sidebar/client'
import type {} from '@supernova-ai/snh-client-ui-conversation/client'
import { PixelNova } from './home-supernova/PixelNova.tsx'
import { SupernovaHeroMark, SupernovaMark, SupernovaName } from './SupernovaBrand.tsx'

/** Required service: the UI slot registry. */
export const inject = ['slots']

/**
 * Fill the blank home with the Supernova effect and replace the default brand marks.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('conversation.hero.frame', () => ctx.slots.register({
    name: 'conversation.hero.frame',
    id: 'supernova-home',
  }, PixelNova))
  ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register({
    name: 'conversation.hero.brand.mark',
  }, SupernovaHeroMark))

  // The product mark is part of the visual identity in every build profile.
  // Local builds keep the shell's "Local Build" label; official builds suppress it.
  if (process.env.SNH_CLIENT_BUILD_PROFILE === 'official') {
    ctx.slots.inject('sidebar.brand.mark', () =>
      ctx.slots.inject('sidebar.brand.name', function* () {
        yield ctx.slots.register({ name: 'sidebar.brand.mark' }, SupernovaMark)
        yield ctx.slots.register({ name: 'sidebar.brand.name' }, SupernovaName)
      }))
    return
  }

  ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({
    name: 'sidebar.brand.mark',
  }, SupernovaMark))
}
