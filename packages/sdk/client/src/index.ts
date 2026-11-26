/**
 * TypeScript client SDK for the SuperNova Harness runtime: spawn the
 * same-version `snh --profile sdk` runtime as a subprocess and drive agent
 * turns over stdio JSON-RPC. `SuperNovaHarness` is the high-level run API;
 * `HarnessClient` is the lower-level protocol client. A pure library — it
 * registers nothing on a Cordis context; named profiles and ordered patch
 * files customize the runtime process it spawns.
 *
 * @module @supernova-ai/snh-sdk-client
 */

export { SuperNovaHarness, HarnessSession, validatedSessionEvent } from './api.ts'
export type { RunOptions } from './api.ts'
export {
  HarnessClient,
  RequestTimeoutError,
  SdkProtocolError,
  TransportClosedError,
} from './client.ts'
export type { NotificationSubscription } from './client.ts'
export { JsonRpcResponseError } from '@supernova-ai/snh-sdk-protocol'
export type {
  ContentBlock,
  SdkEncodedImageBlock,
  SdkPromptContentBlock,
  SdkUserQuestionAnswer,
  SdkUserQuestionResult,
  SdkUserQuestionRequest,
  SuperNovaHarnessOptions,
  HarnessClientOptions,
  HarnessNotification,
  NotificationFilter,
  RunResult,
} from './types.ts'
