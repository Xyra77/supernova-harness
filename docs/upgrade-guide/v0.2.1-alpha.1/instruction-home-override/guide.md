---
kind: upgrade-guide
description: "The `agent-instructions` row no longer accepts `snhHome`; instruction loading always resolves the harness home from `$SNH_HOME` or `~/.snh`."
---

# Instruction loading resolves one harness home

English | [中文](guide.zh.md)

## Change

`@supernova-ai/snh-agent-instructions` removed its `snhHome` config field. The plugin resolves the harness home through `resolveSnhHome()` from `@supernova-ai/snh-home-paths`, like every other harness consumer: the home is `$SNH_HOME` when it is set and non-blank, otherwise `~/.snh`, with tilde expansion.

A `cordis.yml`, profile patch, or `--patch` overlay that still sets `snhHome` on the `agent-instructions` row has no effect: the row keeps the stray key and the plugin ignores it, so instruction loading follows the process home. Other providers, such as `snh-skill-filesystem` and `snh-shell-env`, keep their own home fields; this removal covers the instruction loader only.

## Migration

1. Delete `snhHome` from the `agent-instructions` row in `cordis.yml`, `$SNH_HOME/cordis.patch.yml`, `$SNH_HOME/profiles/<profile>/cordis.patch.yml`, and any `--patch` overlay.
2. Where the override pointed at a non-default home, export `SNH_HOME` for the process instead, so every harness consumer reads that home.
3. Confirm with `snh --profile <profile> --dump-config` that the `agent-instructions` row lists only its remaining fields, and that a new session's first request shows `Instructions from: $SNH_HOME/AGENTS.md` (or `~/.snh/AGENTS.md`) when that file exists.
