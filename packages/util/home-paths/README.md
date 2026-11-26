---
description: "Shared resolution of the SuperNova Harness home, its config, data, state, cache, and backup category paths, and the shared agent configuration root, plus tilde expansion and stable watch paths."
kind: "package-library"
---

# @supernova-ai/snh-home-paths

English | [中文](README.zh.md)

## Summary

`@supernova-ai/snh-home-paths` lets package authors resolve the SuperNova Harness data root and the shared agent configuration root their consumers read. An explicit path wins over the environment variable, which wins over the default under the operating-system home; blank environment values are ignored. Its public helpers can render a root without revealing an absolute machine path, expand only bare or current-user tilde forms, and canonicalize watch targets whose final components do not yet exist. Use it as a direct library dependency, not through `cordis.yml`.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Use these helpers wherever a package must agree with the rest of the harness about where user data lives: resolve the home once, then derive every child path from it.

### Resolving the home

```ts
import { resolveSnhHome, snhHomePath, snhCachePath } from '@supernova-ai/snh-home-paths'

const home = resolveSnhHome()                // configured path, else $SNH_HOME, else ~/.snh
const settings = snhHomePath('settings')     // join one child onto the resolved home
const cache = snhCachePath('models')         // $SNH_HOME/cache/models, default ~/.snh/cache/models
```

An explicit configured path has the highest precedence, then `$SNH_HOME`, then the default `~/.snh`. An empty or whitespace-only `$SNH_HOME` is treated as unset, so a blank override never resolves the home to the current working directory.

`snhCachePath(...segments)` derives paths from the resolved home's `cache` directory. With no segments it returns the cache directory itself. Pass an initial options object, `snhCachePath({ snhHome: home }, ...segments)`, to use an explicit configured home with the same precedence and tilde expansion. It returns an absolute path without creating directories.

<a id="choosing-a-category"></a>
### Choosing a category for a new path

```ts
import { snhPath } from '@supernova-ai/snh-home-paths'

const index = snhPath('state', 'my-plugin', 'index.json')             // $SNH_HOME/state/my-plugin/index.json
const models = snhPath({ category: 'cache', snhHome: '~/other-snh' }, 'my-plugin') // ~/other-snh/cache/my-plugin
```

A new file under the home uses `snhPath(category, ...segments)` and passes its owner's directory name, normally the package name without the `@supernova-ai/snh-` prefix, as the first segment. Use `config` for files a person writes to configure the harness, `data` for records whose loss loses user work, sign-ins, or installed software, `state` for logs, indexes, ids, and other records the harness can lose without losing user work, `cache` for content it can rebuild or download again, and `backup` for backup archives, which users can delete at any time without affecting the harness. Loader `!!js` config expressions receive the same function, for example `root: !!js snhPath('data', 'my-plugin')`. `snhPath` returns an absolute path without creating directories.

Existing entries keep their current locations: conventional top-level entries such as `sessions/`, `profiles/`, `skills/`, `AGENTS.md`, `.env`, and `.credentials.yaml` stay at the top level, and the [home path categories proposal](../../../.agents/notes/proposed/architecture/2026-11-04-snh-home-path-categories.md) lists the category of every other existing path.

### Resolving the shared agents root

```ts
import { resolveAgentsHome, agentsHomeDisplay } from '@supernova-ai/snh-home-paths'

const agents = resolveAgentsHome()   // configured path, else $SNH_AGENTS_HOME, else ~/.agents
agentsHomeDisplay(agents)            // ~/.agents, or $SNH_AGENTS_HOME for any configured root
```

`resolveAgentsHome` applies the same precedence, blank-value handling, and tilde expansion as `resolveSnhHome`. The root is deliberately outside `$SNH_HOME` because other agent tools share it; `snh-agent-instructions` reads its user-global `AGENTS.md`, and `snh-skill-filesystem` scans its `skills/` directory.

### Displaying a home

For user-facing paths, render a root symbolically rather than as a machine path: the default harness home displays as `~/.snh`, any configured harness home as `$SNH_HOME`, the default shared agents root as `~/.agents`, and any configured shared agents root as `$SNH_AGENTS_HOME`. Neither display form leaks an absolute machine path.

### Expanding user paths

`expandHomePath` expands a leading `~`, `~/`, or `~\` against the operating-system home and leaves everything else untouched — non-tilde paths and named-user forms such as `~alice/...` pass through unchanged.

### Canonicalizing watch paths

`canonicalizeWatchPath` gives a native filesystem watcher one canonical spelling of its target: the deepest existing ancestor is resolved through `realpath` and any missing suffix is restored, so a file or directory can be watched before it is created. This prevents Windows from treating a regular-file ancestor as ordinary absence, and prevents 8.3 short-name aliases from mixing with the long paths the native watcher backend emits.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The package is built on one principle: harness user data lives under one root, and the shared agent configuration root stays separate because other agent tools read it too. `resolveRoot` and `rootDisplay` own the precedence and display rules for both roots, so neither can drift from the other.

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Home resolution, path joining, display, tilde expansion, and watch-path canonicalization |

### Resolution rules

`resolveSnhHome` reads the explicit override, then `$SNH_HOME`, then falls back to the operating-system home joined with `.snh`. `resolveAgentsHome` reads the same three levels for `$SNH_AGENTS_HOME` and `~/.agents`. The chosen value is tilde-expanded and normalized to an absolute path; `snhHomePath` and `snhPath` join child segments with Node's platform path rules. `snhHomeDisplay` and `agentsHomeDisplay` compare the resolved path against the default root and return the symbolic label, so a configured root never leaks its absolute path.

### Canonicalization mechanics

`canonicalizeWatchPath` walks up from the target until it finds an existing ancestor, resolves it with `realpath`, proves it is an enumerable directory, and restores the missing suffix. Errors other than absence propagate, and a missing-suffix ancestor that is not a directory is rejected.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when you need the launcher or the consumers that depend on a single home root.

- [Boot package](../../boot/app-boot/README.md) — the launcher that resolves the home before any plugin mounts.
- [Shell environment](../../shell/shell-env/README.md) — how `SNH_HOME` reaches model shell calls.
- [Anonymous user id](../../identity/anonymous-user-id/README.md) — a stored identity file under the resolved home.

-----

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>


These limits define when the helpers are not the right tool. They are current package constraints, not a task backlog.

- **Expansion is deliberately narrow** — only bare `~`, `~/...`, and `~\...` use the current operating-system home; named-user forms such as `~alice/...`, environment variables, and shell expressions remain unchanged.
- **Canonicalization reads but never mutates** — `canonicalizeWatchPath` performs `realpath` probes and propagates errors other than absence; callers still own directory creation, permissions, and trust policy for the resulting path.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
