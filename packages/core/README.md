# @book000/pixivts

[pixiv](https://www.pixiv.net/) Unofficial API Library for TypeScript.

## Installation

```shell
npm install @book000/pixivts
# or
pnpm add @book000/pixivts
# or
yarn add @book000/pixivts
```

## Features

- **Zero runtime dependencies** — no axios, no zod at runtime; uses native `fetch`
- **Result-typed API** — every method returns `Result<T, PixivError>` (no thrown exceptions)
- **ESM + CJS dual output** — works in Node.js (ESM/CJS) and edge runtimes
- **Paginated results** — `PaginatedResultAsync` with async generator for multi-page iteration
- **Resource-based API** — `illusts`, `novels`, `users`, `manga`, `ugoira`, `images` namespaces
- **Token refresh** — automatic refresh-token → access-token exchange on startup and 401 retry

## Quick Start

```typescript
import { PixivClient } from '@book000/pixivts'

const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!)

// Fetch a single illust
const result = await client.illusts.detail({ illustId: 12345 })
if (result.isOk) {
  console.log(result.value.illust.title)
}

// Search illusts (single page)
const searchResult = await client.illusts.search({ word: 'hatsune miku' })
if (searchResult.isOk) {
  for (const illust of searchResult.value.illusts) {
    console.log(illust.id, illust.title)
  }
}

// Iterate over all pages
for await (const page of client.illusts.search({ word: 'hatsune miku' }).pages()) {
  for (const illust of page.illusts) {
    console.log(illust.id, illust.title)
  }
}

// Iterate over all items across pages (async generator — throws on fetch error)
for await (const illust of client.illusts.search({ word: 'hatsune miku' }).items()) {
  console.log(illust.id, illust.title)
}
```

## API

### `PixivClient.of(refreshToken, opts?)`

Creates a `PixivClient` by exchanging the given refresh token for an access token.

| Option | Type | Default | Description |
|---|---|---|---|
| `refreshToken` | `string` | — | pixiv OAuth refresh token |
| `opts.retry.maxRetries` | `number` | `3` | Max 429 retry attempts |
| `opts.retry.waitMs` | `number` | `10000` | Default wait (ms) when no `Retry-After` header is present |
| `opts.onResponse` | `ResponseInterceptor` | — | Called after every API response (used by `@book000/pixivts-db-mysql`) |

### Resources

| Namespace | Methods |
|---|---|
| `illusts` | `detail`, `related`, `search`, `ranking`, `recommended`, `series`, `bookmarkAdd`, `bookmarkDelete` |
| `novels` | `detail`, `text`, `related`, `search`, `ranking`, `recommended`, `series`, `bookmarkAdd`, `bookmarkDelete` |
| `users` | `detail`, `illusts`, `novels`, `following`, `followAdd`, `followDelete` |
| `users.bookmarks` | `illusts`, `novels` |
| `manga` | `recommended` |
| `ugoira` | `metadata` |
| `images` | `fetch` |

### Error Handling

```typescript
import type { PixivError } from '@book000/pixivts'

const result = await client.illusts.detail({ illustId: 12345 })

if (result.isErr) {
  const err: PixivError = result.error
  switch (err.type) {
    case 'rate_limit':
      console.error(`Rate limited. Retry after ${err.retryAfter}ms`)
      break
    case 'auth_failed':
      console.error(`Auth failed with status ${err.status}`)
      break
    case 'api_error':
      console.error(`API error ${err.status}`)
      break
    case 'network':
      console.error('Network error', err.cause)
      break
  }
}
```

### Result API

```typescript
// Transform on success
const title = result.map((data) => data.illust.title)

// Provide a fallback on error
const titleOrFallback = result.unwrapOr('Unknown')

// Match both branches
const message = result.match(
  (data) => `Title: ${data.illust.title}`,
  (err) => `Error: ${err.type}`,
)
```

## API Documentation

Full API reference: <https://book000.github.io/pixivts/>

## License

This project is licensed under the [MIT License](../../LICENSE)
