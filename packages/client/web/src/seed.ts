/** Initial module manifests; owned Client libraries are compiled before shell assembly. */
import * as React from 'react'
import * as ReactJsxRuntime from 'react/jsx-runtime'
import * as ReactDom from 'react-dom'
import * as ReactDomClient from 'react-dom/client'
import * as Cordis from '@supernova-ai/cordis'
import * as Zod from 'zod'
import * as ReactVirtual from '@tanstack/react-virtual'
import * as ClientStore from '@supernova-ai/snh-client-store'
import * as UiSlots from '@supernova-ai/snh-client-ui-slots'
import * as UiPrimitives from '@supernova-ai/snh-client-ui-primitives'
import * as UiDockkit from '@supernova-ai/snh-client-ui-dockkit'
import type { SnhClientModuleManifest } from '@supernova-ai/snh-package-manifest'
import { STATIC_MODULE_MANIFEST_EXPORT, type PlatformModule } from './platform.ts'

/** Read the manifest a `staticLinked` library exports beside its ordinary exports. */
function compiledModule(id: string, namespace: object): SnhClientModuleManifest {
  const manifest: unknown = Reflect.get(namespace, STATIC_MODULE_MANIFEST_EXPORT)
  if (typeof manifest !== 'object' || manifest === null
    || !('id' in manifest) || manifest.id !== id
    || !('factory' in manifest) || typeof manifest.factory !== 'function'
    || ('meta' in manifest && manifest.meta !== undefined && typeof manifest.meta !== 'function')) {
    throw new Error(`web boot: ${id} must be built with staticLinked before shell assembly`)
  }
  return manifest as SnhClientModuleManifest
}

function platform(id: string, exports: Record<string, unknown>): SnhClientModuleManifest {
  return { id, factory: () => exports }
}

/**
 * Supply shared third-party identities and package-generated manifests through one protocol.
 * @returns Initial module registrations; JavaScript and metadata factories are not evaluated here.
 */
export function getStaticModules(): readonly SnhClientModuleManifest[] {
  return Object.values({
    'react': platform('react', React),
    'react/jsx-runtime': platform('react/jsx-runtime', ReactJsxRuntime),
    'react-dom': platform('react-dom', ReactDom),
    'react-dom/client': platform('react-dom/client', ReactDomClient),
    '@supernova-ai/cordis': platform('@supernova-ai/cordis', Cordis),
    'zod': platform('zod', Zod),
    '@tanstack/react-virtual': platform('@tanstack/react-virtual', ReactVirtual),
    '@supernova-ai/snh-client-store': compiledModule('@supernova-ai/snh-client-store', ClientStore),
    '@supernova-ai/snh-client-ui-slots': compiledModule('@supernova-ai/snh-client-ui-slots', UiSlots),
    '@supernova-ai/snh-client-ui-primitives': compiledModule('@supernova-ai/snh-client-ui-primitives', UiPrimitives),
    '@supernova-ai/snh-client-ui-dockkit': compiledModule('@supernova-ai/snh-client-ui-dockkit', UiDockkit),
  } satisfies Record<PlatformModule, SnhClientModuleManifest>)
}
