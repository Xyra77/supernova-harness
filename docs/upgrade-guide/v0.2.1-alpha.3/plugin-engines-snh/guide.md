---
kind: upgrade-guide
description: "Plugin compatibility checks read engines.snh before SNH peerDependencies, and refusals report requirements instead of peers."
---

# Plugin compatibility reads `engines.snh` first

English | [中文](guide.zh.md)

## Change

In v0.2.1-alpha.3, installation and profile startup judged a plugin or bundle only by its `peerDependencies` on `@supernova-ai/snh` and `@supernova-ai/snh-*`, and ignored `engines.snh`. In the next release, an own `engines.snh` range decides alone and those peers are ignored; the peer rule applies only when `engines.snh` is absent. `workspace:` values are valid only in peers; in `engines.snh` they are incompatible. A non-object `engines` or a non-string `engines.snh` makes the manifest unreadable for compatibility, which refuses the package. Plugin authors whose package declares `engines.snh`, or declares `engines` as something other than an object, are affected.

The `incompatible-version` refusal record that the plugin manager returns to clients, `IncompatiblePlugin`, and the app-boot `PluginCompatibility` result rename `peers` to `requirements`. Keys are `engines.snh` for the engines rule or the peer package name for the fallback. Code that reads these records is affected.

## Migration

1. If your package declares `engines.snh`, make that range cover every SNH release the package supports, because SNH peer ranges no longer widen or narrow it. Remove `engines.snh` to keep peer-based checking.
2. Replace `workspace:` values in `engines.snh` with a semantic version range.
3. Read `requirements` instead of `peers` from `IncompatiblePlugin` and `PluginCompatibility`.
4. Confirm by installing the package with `snh plugin --profile <profile> add <package@version>` or the plugin manager: a mismatch names `engines.snh` or the peer package in the refusal.
