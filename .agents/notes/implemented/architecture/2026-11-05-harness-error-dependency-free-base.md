# Agent Note: Keep the HarnessError base in a dependency-free package

Status: implemented

English | [中文](2026-11-05-harness-error-dependency-free-base.zh.md)

## Problem

The tool registry records a failed result's `error.name` and `error.code` only when the thrown value is `instanceof HarnessError`, so every expected failure must extend the one shared class; copying its `code` field is not enough. The [archived structured-error-taxonomy note](../../archived/architecture/2026-06-11-structured-error-taxonomy.md) placed the base in `snh-llm` because `snh-llm` was then a leaf that every package already imported, so the base added no dependency edge.

`snh-llm` stopped being a leaf. `ImageBlock` references `ImageAttachmentRef` from `snh-attachment`, and `snh-llm` depends on `snh-typert-protocol`. A class in either lower package cannot extend a base defined in `snh-llm` without a TypeScript project-reference cycle, so `AttachmentError` and `RemoteError` re-implement the `code` field on plain `Error`, and tool failures that carry them persist without structured identity.

## Decision

`HarnessError` lives in `@supernova-ai/snh-error` (`packages/util/error`), a package with no dependencies that contains only the base class. `snh-llm` depends on it and re-exports the same class from its entry, so existing `import { HarnessError } from '@supernova-ai/snh-llm'` statements keep working and both import paths name one constructor, which keeps `instanceof` checks consistent. LLM-specific failure codes and helpers such as `isHarnessError` stay in `snh-llm`.

New code imports `HarnessError` from `snh-error` when the importing package does not otherwise need `snh-llm`, so a package that needs only the base takes no dependency on the LLM runtime. Packages below `snh-llm`, such as `snh-attachment`, can extend the base without a cycle.

## Alternatives considered

**Keep the base in `snh-llm`.** Lower packages would keep re-implementing the field shape, and the registry would keep dropping their codes; recognizing those shapes structurally in the registry would make it trust any object with a string `code`, including Node errno values.

**Recognize specific classes in the registry.** Matching `RemoteError` or `AttachmentError` by marker would add a dependency from `snh-tools` to each package and repeat for every new low-level error class.

**Move the base to an existing utility package.** `snh-util-values` and `snh-brand` have unrelated roles; a dedicated package names the role and keeps the base free of their dependencies and change history.

**Drop the `snh-llm` re-export.** Every existing import would have to change in one step without a behavior benefit.

## Consequences

Any package can extend `HarnessError`, including packages that `snh-llm` depends on, and the base no longer changes with the LLM runtime. The cost is one more published package and one more dependency edge for `snh-llm`. Two import paths exist for one class; both are supported, and the error-handling rules name `snh-error` as the home.
