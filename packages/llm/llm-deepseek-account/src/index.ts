/** Account-token authentication, the account model listing, and version gating for the SuperNova account route. */
import type {} from '@supernova-ai/cordis-plugin-loader'
import type { Context } from '@supernova-ai/cordis'
import { ACCOUNT_QUOTA_EXCEEDED_CODE, APP_IDENTITY, LlmError, QUOTA_EXCEEDED_CODE } from '@supernova-ai/snh-llm'
import type { SuperNovaAuthorization } from '@supernova-ai/snh-supernova-auth'
import { launchEnvironmentOf } from '@supernova-ai/snh-launch-environment'
import {
  catalogModelInfo, createModelListingCache, refuseListedModel, registerSuperNovaProvider, resolveAdapterOptions, resolveListedCatalog,
} from '@supernova-ai/snh-llm-supernova'
import type { SuperNovaRequestAuth, ListedCatalog, ListingView, ModelListing, ResolvedSuperNovaOptions } from '@supernova-ai/snh-llm-supernova'
import { cancelAccountTasks, installAccountTaskCancellation } from './account-tasks.ts'
import { Config, plainAccountOptions, resolveAccountOptions } from './config.ts'

export { Config } from './config.ts'
export const name = 'llm-deepseek-account'
export const inject = ['llm', 'supernovaAuth']

const PROVIDER = 'deepseek-account'
/** Console tag of listing diagnostics; product profiles mount no console exporter for `ctx.logger`. */
const LOG_TAG = '[llm-deepseek-account]'

/** Connection facts of one account operation: protocol settings plus the catalog resolved with them. */
interface AccountConnection extends ResolvedSuperNovaOptions {
  readonly catalog: ListedCatalog
}

export function apply(ctx: Context, config: Config): void {
  const environment = launchEnvironmentOf(ctx)
  const settings = () => resolveAccountOptions(plainAccountOptions(config), environment)
  settings()
  // Every other SuperNova consumer billed by the account sends the sign-in to this route's deployment.
  ctx.effect(() => ctx.supernovaAuth.connect('account', PROVIDER, () => ({ baseURL: settings().protocol.baseURL })), 'llm-deepseek-account: account deployment')
  const supported = resolveAdapterOptions({}).models
  /**
   * The account sign-in `ctx.supernovaAuth` releases for one destination under the deployment at `baseURL`; absent
   * without an allowed signed-in account or without the account service.
   */
  const requestCredential = (baseURL: string, endpoint: string): Promise<SuperNovaAuthorization | undefined> =>
    ctx.supernovaAuth.authorize({
      consumer: name, accepts: ['account'], billing: 'account', destination: { url: endpoint }, connections: { account: { baseURL } },
    })
  /** The failure of a request whose account signed out before it finished: the code a request made after the sign-out fails with. */
  const signedOutMidRequest = (cause: unknown) => new LlmError(
    'The SuperNova account signed out before this request finished. Sign in to SuperNova to use the account provider.',
    'ACCOUNT_SIGN_IN_REQUIRED',
    { cause },
  )
  const resolveAuth = async (connection: ResolvedSuperNovaOptions, endpoint: string): Promise<SuperNovaRequestAuth | undefined> => {
    const credential = await requestCredential(connection.baseURL, endpoint)
    if (credential === undefined) return undefined
    return {
      ...credential,
      onRequestError: async (error) => {
        try {
          // A sign-out ends the requests that carry its token, so it is the failure of any request that fails after it.
          if (credential.revoked?.aborted === true) return signedOutMidRequest(error)
          if (!(error instanceof LlmError)) return error
          if (error.code === QUOTA_EXCEEDED_CODE) {
            return new LlmError(error.message, ACCOUNT_QUOTA_EXCEEDED_CODE, { ...error.failure, cause: error })
          }
          if (error.failure.status !== 401) return error
          const rejected = new LlmError(error.message, 'ACCOUNT_TOKEN_INVALID', { ...error.failure, cause: error })
          await credential.reject?.()
          return rejected
        } finally {
          // A request can outlive this plugin and the sign-out listener it mounts. Once the credential it carried is
          // signed out, by the user or by the rejection above, the request ends this route's tasks itself.
          if (credential.revoked?.aborted === true) cancelAccountTasks(ctx, PROVIDER)
        }
      },
    }
  }
  const missingCredential = () => new LlmError(
    'Sign in to SuperNova to use the account provider. The request destination must allow account authentication.',
    'ACCOUNT_SIGN_IN_REQUIRED',
  )
  const catalog = createModelListingCache(ctx, name, PROVIDER, {
    settings: () => settings().catalog,
    credential: async url => (await requestCredential(settings().protocol.baseURL, url))?.headers,
  })
  let loggedListing: ModelListing | undefined
  /** Resolve the catalog, reporting each listing's hidden entries and dropped badges once. */
  const connectionOf = (view: ListingView): AccountConnection => {
    const resolved = settings()
    const result = resolveListedCatalog({
      listing: view.listing?.entries,
      supported,
      overrides: resolved.modelOverrides,
      routeMaxTokens: resolved.protocol.maxTokens,
      clientVersion: APP_IDENTITY.version,
    })
    if (view.listing !== loggedListing) {
      loggedListing = view.listing
      for (const problem of result.problems) console.warn(LOG_TAG, problem)
    }
    return { ...resolved.protocol, models: result.resolution, catalog: result }
  }
  const entry = { provider: PROVIDER, displayName: 'SuperNova Account', settingsNs: ctx.fiber.entry?.options.id ?? name, settingsPath: [] }
  const directory = ctx.llm.registerConfigurableProviders([entry])
  let reportedError: string | undefined
  /** Publish override diagnostics on the provider directory. */
  const discovered = (view: ListingView): AccountConnection => {
    const connection = connectionOf(view)
    const error = connection.catalog.overrideErrors.length === 0 ? undefined : connection.catalog.overrideErrors.join('; ')
    if (error !== reportedError) {
      reportedError = error
      directory.replace([error === undefined ? entry : { ...entry, error }])
    }
    return connection
  }
  registerSuperNovaProvider<AccountConnection>(ctx, PROVIDER, {
    providerName: 'SuperNova Account',
    options: () => connectionOf(catalog.current()),
    connect: async signal => connectionOf(await catalog.view(settings().catalog, signal)),
    resolveAuth,
    missingCredential,
    admit: (connection, model) => { refuseListedModel(model, connection.catalog.refusals.get(model)) },
    discoverModels: async (provider) => {
      const view = await catalog.view(settings().catalog)
      if (!view.authenticated) return []
      const { offered, badges } = discovered(view).catalog
      return offered.map(model => catalogModelInfo(provider, model, badges.get(model.id)))
    },
  })
  installAccountTaskCancellation(ctx, PROVIDER)
}
