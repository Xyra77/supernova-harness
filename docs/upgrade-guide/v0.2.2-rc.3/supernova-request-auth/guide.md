---
kind: upgrade-guide
description: "SuperNova model routes and web providers require the new snh-supernova-auth plugin; the llm-supernova credential helpers, the snh-llm API key check, the route plugins' config exports, and account Agent inspection are removed."
---

# SuperNova consumers authenticate through ctx.supernovaAuth

English | [中文](guide.zh.md)

## Change

`@supernova-ai/snh-supernova-auth` provides `ctx.supernovaAuth`, which releases the API key or the account sign-in for one SuperNova request. `@supernova-ai/snh-llm-supernova-api-key`, `@supernova-ai/snh-llm-deepseek-account`, `@supernova-ai/snh-web-supernova-api`, and `@supernova-ai/snh-web-search-supernova` declare it as a peer dependency and start only in a composition that mounts it. The `base` and `sdk-minimal` bundles mount it.

`@supernova-ai/snh-llm-supernova` no longer exports `resolveSuperNovaApiKey`, `deepSeekApiKeyConfigured`, `resolveSuperNovaAccountToken`, or `rejectSuperNovaAccountToken`. `SuperNovaAdapterOptions.resolveAuth(connection, endpoint)` returns `SuperNovaRequestAuth | undefined`, `SuperNovaRequestAuth` gains an optional `revoked` signal, and the new `missingCredential` option names the missing-credential failure. `createModelListingCache` takes `credential(url)` returning request headers, and its `load` is optional.

`@supernova-ai/snh-llm` no longer exports `normalizeApiKey` and `assertUsableApiKey`. `@supernova-ai/snh-credentials` exports `normalizeApiKey(raw)`, `resolveCredentialRef(ctx, ref)`, and `credentialRefConfigured(ctx, ref)`.

`@supernova-ai/snh-llm-supernova-api-key` no longer exports `plainOptions` and `resolveAdapterOptions`; `@supernova-ai/snh-llm-deepseek-account` no longer exports `plainAccountOptions` and `resolveAccountOptions`. The account route plugin cancels its running Agents after sign-out and registers a running-task report.

`@supernova-ai/snh-deepseek-account` adds Host-only `resolveRequestCredential(url)` and `registerRunningTaskReport(report)` and makes `resolveToken(url)` and `rejectToken(token)` private; `hasRunningAccountTasks()` answers from registered reports and no longer reads `ctx.agents`. A sign-out aborts released credentials' `revoked` signal, ending in-flight account requests: model requests outside a turn fail with `ACCOUNT_SIGN_IN_REQUIRED`, Search and Fetch with `WEB_PROVIDER_ERROR`. The package drops its `snh-agent` and `snh-llm` peer dependencies and moves from `packages/credentials/` to `packages/account/` under its unchanged name.

Without the account route, the Search and Fetch APIs send the account credential to the origin `DEEPSEEK_BASE_URL` names and reject a value that is not an HTTP(S) URL without embedded credentials. With `auto` billing, a `deepseek-account` or `deepseek-official` conversation whose route plugin is not mounted tries the API key, then the account credential. `SuperNovaSearchProviderOptions` replaces `resolveAccountToken`, `rejectAccountToken`, and `resolveApiKey` with `authorize(endpoint, signal)`.

## Migration

1. Add `- name: '@supernova-ai/snh-supernova-auth'` to every composition that mounts one of the four plugins without the `base` or `sdk-minimal` bundle. Code that mounts them through `ctx.plugin()` mounts the package's default export first.
2. Replace the removed `llm-supernova` helpers with `ctx.supernovaAuth.authorize({ consumer, accepts, destination })`: send the returned `headers`, call `reject()` after HTTP 401 when present, and end the request when `revoked` aborts. `candidates()` answers presence checks.
3. Replace `assertUsableApiKey` with `normalizeApiKey` from `@supernova-ai/snh-credentials`, and throw your own error for its `reason`.
4. In custom `SuperNovaAdapter` or `registerSuperNovaProvider` consumers, return `undefined` from `resolveAuth` when no credential exists and supply `missingCredential` for a route-specific failure. Pass credential headers, not a token, to `createModelListingCache`.
5. Replace imports of the route plugins' config exports with the plugins' own `Config`.
6. Make `supernovaAccount` stand-ins implement `resolveRequestCredential`, returning a `revoked` signal; stand-ins that supplied `ctx.agents` for `hasRunningAccountTasks()` register a report instead.
7. Update workspace references to `packages/account/deepseek-account`; the npm package name, Remote namespace, and configuration keys are unchanged.
8. Replace `resolveAccountToken`, `rejectAccountToken`, and `resolveApiKey` in `SuperNovaSearchProviderOptions` with `authorize`.
9. Type-check the callers, then send one SuperNova model request and one web search in each changed composition.
