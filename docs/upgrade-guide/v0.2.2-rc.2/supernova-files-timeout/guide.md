---
kind: upgrade-guide
description: "Keep a longer image upload deadline on slow SuperNova gateways."
---
# SuperNova image upload timeout

English | [中文](guide.zh.md)

## Change

The default `filesApiTimeoutMs` falls from 60,000 to 20,000 milliseconds. After an upload times out, the adapter sends inline images for the next request that needs an upload. Further timeouts double the number of requests skipped. A successful upload resets the count.

## Migration

If your gateway needs the previous deadline, set `filesApiTimeoutMs: 60000` on the SuperNova provider in the active profile’s `cordis.patch.yml`. Existing explicit values take effect as configured. Run `snh --profile <profile> --dump-config` and check the value on the provider entry.
