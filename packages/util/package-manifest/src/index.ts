/**
 * Public package manifest and plugin display types, with no runtime exports.
 * @module @supernova-ai/snh-package-manifest
 */

export type {
  ClientModuleStylesheetDescriptor,
  ClientModuleStyleContext,
  ClientModuleMeta,
  ClientModuleMetaFactory,
  ClientBundleRequire,
  ClientModuleFactory,
  SnhClientModuleManifest,
} from './client-module.ts'

export type {
  SnhBundleManifest,
  SnhClientManifest,
  SnhEnginesManifest,
  SnhManifest,
  SnhPackageManifest,
  SnhProfileManifest,
  LocalizedText,
  PluginLocalizedMeta,
} from './types.ts'
