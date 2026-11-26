/** Wire types for the active SuperNova plugin package inventory. */

/** One active plugin package, with its version when available. */
export interface SuperNovaPluginPackageIdentity {
  readonly name: string
  readonly version?: string
}

/** Versioned full package inventory carried by each official SuperNova request. */
export interface SuperNovaPluginPackageInventoryExtension {
  readonly version: 1
  readonly packages: readonly SuperNovaPluginPackageIdentity[]
}

declare module '@supernova-ai/snh-supernova-llm-api-extensions/types' {
  interface SuperNovaLlmApiExtensionMap {
    snh_plugin_packages: SuperNovaPluginPackageInventoryExtension
  }
}
