---
kind: upgrade-guide
description: Update removed package subpaths; retained identity constructors remain available.
---

# Update removed package subpath imports

English | [中文](guide.zh.md)

## Change

Upgrading from v0.2.2-rc.2 removes the seven package subpaths below. Existing identity-only string constructors remain available at retained entrypoints; their implementations and branded type definitions are preserved. The `/types` entries re-export those types without runtime values. Persisted strings, Session formats, validation and ID generation do not change.

| Removed subpath | Type import or supported replacement |
|---|---|
| `@supernova-ai/snh-commands/brand` | `@supernova-ai/snh-commands/types` |
| `@supernova-ai/snh-browser-use/brand` | `@supernova-ai/snh-browser-use/types` |
| `@supernova-ai/snh-computer-use/brand` | `@supernova-ai/snh-computer-use/types` |
| `@supernova-ai/snh-jobs/brand` | `@supernova-ai/snh-jobs/types` |
| `@supernova-ai/snh-llm/brand` | `@supernova-ai/snh-llm/types` |
| `@supernova-ai/snh-tools/presentation` | Type imports from `@supernova-ai/snh-tools` |
| `@supernova-ai/snh-file-reference-local/search` | The `fileReferences` service; no replacement public search helper |

## Migration

1. Move identifier type imports from the five `/brand` paths to the corresponding `/types` entries, using `import type`. These entries do not replace runtime constructor imports.
2. For existing constructor calls from the removed paths, commands, jobs and LLM callers can import the retained constructor from the package root. Browser/computer provider-name constructors were not root exports; use `brandString<ProviderName>(value)` with the type from `/types`. Add `@supernova-ai/snh-brand` as a direct dependency when importing its runtime helper. Keep validation and UUID/counter generation where they already occur.

   ```ts
   import { brandString } from '@supernova-ai/snh-brand'
   import type { BrowserUseProviderName } from '@supernova-ai/snh-browser-use/types'

   const providerName = brandString<BrowserUseProviderName>('my-browser-provider')
   ```

3. Compile and run your plugin/SDK tests, then load plain-JavaScript fixtures under Node. Check for `ERR_PACKAGE_PATH_NOT_EXPORTED` and missing named-export errors; TypeScript checking alone does not cover `.mjs` consumers.
