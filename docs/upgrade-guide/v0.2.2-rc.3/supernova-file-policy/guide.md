---
kind: upgrade-guide
description: "Direct SuperNovaFileStore callers must supply a resolved file upload policy."
---

# Resolve the file policy for SuperNovaFileStore

English | [中文](guide.zh.md)

## Change

The published `SuperNovaFilePolicy` type now requires `uploadConcurrency`, `uploadMaxRetries`, `uploadRetryDelayMs`, and `uploadTimeoutMs`. This affects TypeScript callers that construct their own policy for `SuperNovaFileStore`.

## Migration

1. Import `resolveAdapterOptions` from `@supernova-ai/snh-llm-supernova`. Pass `resolveAdapterOptions(options).filePolicy` where you previously assembled a policy. To carry over custom expiry, refresh and cleanup values, supply `fileExpiresAfterSeconds`, `fileRefreshMarginSeconds` and `fileQuotaCleanupBatch` in `options`.
2. Type-check the caller and upload an image using `ensureUploaded`. The returned record contains its Files API id.
