/**
 * Resolve the public SDK launch configuration to one snh subprocess.
 * @module @supernova-ai/snh-sdk-client/launch
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { HarnessClientOptions } from './types.ts'

/** Default bound for a profile to answer the SDK initialize handshake. */
export const DEFAULT_INITIALIZE_TIMEOUT_MS = 10_000

/** Internal generic process launch used by the transport and fake-runtime tests. */
export interface RuntimeProcessOptions {
  command: string
  args: string[]
  cwd?: string
  /** Materialize the complete child environment when the client starts its subprocess. */
  environment: () => NodeJS.ProcessEnv
  description: string
  initializeTimeoutMs: number
  requestTimeoutMs?: number
  shutdownTimeoutMs?: number
  disposeEofGraceMs?: number
  disposeGraceMs?: number
}

/** Node argv plus internal profile patches required by one resolved snh entry. */
export interface SnhNodeLaunch {
  /** Arguments before the profile selector. */
  nodeArgs: string[]
  /** Internal patches applied below caller-supplied patches. */
  patches: string[]
  /** Environment values required by the resolved entry mode. */
  environment: NodeJS.ProcessEnv
}

interface PackageManifest {
  version?: unknown
  bin?: unknown
}

/** Read a package manifest from one resolved package.json URL. */
function manifest(url: string): PackageManifest {
  return JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as PackageManifest
}

/**
 * Resolve and version-check a snh executable from package manifests.
 * @param snhManifestUrl - resolved URL of the snh package manifest.
 * @param clientManifestUrl - resolved URL of the SDK client manifest.
 * @returns the absolute snh executable path.
 */
export function resolveSnhBinFromManifests(snhManifestUrl: string, clientManifestUrl: string): string {
  const snhManifest = manifest(snhManifestUrl)
  const clientManifest = manifest(clientManifestUrl)
  if (typeof snhManifest.version !== 'string' || snhManifest.version !== clientManifest.version) {
    throw new Error(`snh SDK client ${String(clientManifest.version)} requires the same snh version, got ${String(snhManifest.version)}`)
  }
  const bin = typeof snhManifest.bin === 'object' && snhManifest.bin !== null
    ? (snhManifest.bin as Record<string, unknown>).snh
    : snhManifest.bin
  if (typeof bin !== 'string' || bin === '') throw new Error('@supernova-ai/snh declares no snh executable')
  return resolve(dirname(fileURLToPath(snhManifestUrl)), bin)
}

/**
 * Resolve and version-check the built snh executable installed with this SDK.
 * @returns the absolute built executable path, whether or not it exists in a source checkout.
 */
export function installedSnhBin(): string {
  return resolveSnhBinFromManifests(
    import.meta.resolve('@supernova-ai/snh/package.json'),
    new URL('../package.json', import.meta.url).href,
  )
}

/**
 * Resolve the Node launch for one same-version snh package.
 * @param snhManifestUrl - resolved URL of the snh package manifest.
 * @param clientManifestUrl - resolved URL of the SDK client manifest.
 * @param sourceLoaderUrl - optional absolute tsx loader URL for deterministic tests.
 * @returns built output, or the source entry plus its compatibility patch and tsx environment.
 */
export function resolveSnhNodeLaunchFromManifests(
  snhManifestUrl: string,
  clientManifestUrl: string,
  sourceLoaderUrl?: string,
): SnhNodeLaunch {
  const bin = resolveSnhBinFromManifests(snhManifestUrl, clientManifestUrl)
  if (existsSync(bin)) return { nodeArgs: [bin], patches: [], environment: {} }

  const packageDir = dirname(fileURLToPath(snhManifestUrl))
  const sourceBin = resolve(packageDir, 'src/bin.ts')
  const sourcePatch = resolve(packageDir, 'src/sdk-source.cordis.patch.yml')
  const sourceTsconfig = resolve(packageDir, 'tsconfig.json')
  if (!existsSync(sourceBin) || !existsSync(sourcePatch) || !existsSync(sourceTsconfig)) {
    throw new Error(
      `@supernova-ai/snh is missing its built executable ${bin} and complete source launch files ${sourceBin}, ${sourcePatch}, ${sourceTsconfig}`,
    )
  }
  const loader = sourceLoaderUrl ?? import.meta.resolve('tsx/esm')
  return {
    nodeArgs: ['--import', loader, sourceBin],
    patches: [sourcePatch],
    environment: { TSX_TSCONFIG_PATH: sourceTsconfig },
  }
}

/**
 * Resolve the installed snh package to a built or source Node launch.
 * @returns the launch descriptor for the current checkout or installed package.
 */
function installedSnhNodeLaunch(): SnhNodeLaunch {
  return resolveSnhNodeLaunchFromManifests(
    import.meta.resolve('@supernova-ai/snh/package.json'),
    new URL('../package.json', import.meta.url).href,
  )
}

/**
 * Resolve caller-relative filesystem inputs and construct canonical snh argv.
 * @param options - public SDK launch options.
 * @param callerCwd - parent-process directory used for lexical resolution.
 * @returns one generic subprocess spec for the JSON-RPC transport.
 */
export function resolveSnhLaunch(
  options: HarnessClientOptions = {},
  callerCwd: string = process.cwd(),
): RuntimeProcessOptions {
  const profile = options.profile ?? 'sdk'
  const snhLaunch = options.snhBin === undefined
    ? installedSnhNodeLaunch()
    : { nodeArgs: [resolve(callerCwd, options.snhBin)], patches: [], environment: {} }
  const patches = [
    ...snhLaunch.patches,
    ...(options.patches ?? []).map(path => resolve(callerCwd, path)),
  ]
  const snhHome = options.snhHome === undefined ? undefined : resolve(callerCwd, options.snhHome)
  return {
    command: process.execPath,
    args: [...snhLaunch.nodeArgs, '--profile', profile, ...patches.flatMap(path => ['--patch', path])],
    ...options.processCwd === undefined ? {} : { cwd: resolve(callerCwd, options.processCwd) },
    environment: () => ({
      ...(options.env ?? process.env),
      ...snhLaunch.environment,
      ...snhHome === undefined ? {} : { SNH_HOME: snhHome },
    }),
    description: `snh profile ${JSON.stringify(profile)}`,
    initializeTimeoutMs: options.initializeTimeoutMs ?? DEFAULT_INITIALIZE_TIMEOUT_MS,
    ...options.requestTimeoutMs === undefined ? {} : { requestTimeoutMs: options.requestTimeoutMs },
    ...options.shutdownTimeoutMs === undefined ? {} : { shutdownTimeoutMs: options.shutdownTimeoutMs },
    ...options.disposeEofGraceMs === undefined ? {} : { disposeEofGraceMs: options.disposeEofGraceMs },
    ...options.disposeGraceMs === undefined ? {} : { disposeGraceMs: options.disposeGraceMs },
  }
}
