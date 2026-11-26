---
kind: upgrade-guide
description: "The shipped composition no longer fixes a search provider, so web search in a conversation on a SuperNova model runs legacy Messages search instead of the SuperNova Search API."
---

# Search on SuperNova models defaults to legacy Messages search

English | [中文](guide.zh.md)

## Change

Previously, the shared base composition set `web.searchProvider` to `supernova-search-api`, so every search was one SuperNova Search API request. Now the base sets no `searchProvider`, and `snh-web` selects per model provider route. A search made for a model request on the `deepseek-official` or `deepseek-account` route runs the `deepseek-official` search provider: an auxiliary Messages request to `web-search-supernova`'s endpoint, which has no per-search charge and is billed as model tokens, and which appends a `web/supernova-search-llm-request` event to the Session log. A search on any other route, or outside a model request, still runs `supernova-search-api`.

The Messages search endpoint does not follow the model provider's base URL: it is `web-search-supernova.baseURL`, else `$DEEPSEEK_SEARCH_BASE_URL`, else `https://api.deepseek.com/anthropic/v1`, and outside an account conversation it receives the key under `web-search-supernova.apiKeyEnv` (`DEEPSEEK_API_KEY` by default). A deployment whose SuperNova model provider points at a gateway therefore sends that key to the official endpoint and its searches fail until step 2 or 3 is applied.

The Web search provider menu on the Web search and fetch settings page gains **Automatic**, which is the selection when none is stored. A composition or profile that sets `web.searchProvider` itself, and `SNH_WEB_SEARCH_PROVIDER`, see no change. Fetch still defaults to `http`.

## Migration

1. To accept the new default, change nothing. Confirm: the Web search provider menu shows Automatic, and a search in a conversation on a SuperNova model appends a `web/supernova-search-llm-request` event.
2. To keep the SuperNova Search API for every model, select SuperNova Search API in that menu and save, or set `searchProvider: supernova-search-api` beside `fetchProvider: http` in the `config` of the `@supernova-ai/snh-web` row. Confirm: the menu shows SuperNova Search API, and a search appends no `web/supernova-search-llm-request` event.
3. To use Messages search through a gateway, select SuperNova server-side search in that menu and save the gateway's Anthropic-compatible base, which ends before `/messages`, as its Base URL, or set `web-search-supernova.baseURL`; then select Automatic again if other models should keep the Search API. Confirm: a search on a SuperNova model returns results, and its `web/supernova-search-llm-request` event names the gateway endpoint.
