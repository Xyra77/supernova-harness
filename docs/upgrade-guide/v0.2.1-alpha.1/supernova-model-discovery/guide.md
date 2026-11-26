---
kind: upgrade-guide
description: "SuperNova API-key model discovery requires a configured credential."
---

# SuperNova API-key model visibility

English | [中文](guide.zh.md)

## Change

The `deepseek-official` route previously listed its configured models without an API key. It now returns an empty catalog when its credential is missing, so Desktop and Web hide the SuperNova group. Model discovery reports malformed credentials and credential lookup failures. A saved or default selection absent from the catalog displays “Select model” without changing the stored selection. The independent SuperNova account route still uses account login.

## Migration

1. To use the API-key route, configure its key in Settings → Models or supply the reference named by `apiKeyEnv` (default `DEEPSEEK_API_KEY`) through the launch environment.
2. Reopen the model selector and confirm the SuperNova group appears. Custom discovery consumers must handle an empty catalog before credentials are configured; listing models does not verify that the remote API accepts the key.
