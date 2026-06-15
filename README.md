# pixivts

[pixiv](https://www.pixiv.net/) Unofficial API Library for TypeScript

This is NOT a fork of [@ibaraki-douji/pixivts](https://www.npmjs.com/package/@ibaraki-douji/pixivts). However, it is used as a reference.

## ✨ Features

- **Zero runtime dependencies** — no axios, no zod at runtime; uses native `fetch`
- **Result-typed API** — every method returns `Result<T, PixivError>`; no thrown exceptions for API errors
- **Automatic token refresh** — exchanges the refresh token for an access token on startup, and retries on 401
- **ESM + CJS dual output** — works in Node.js ESM/CJS and edge runtimes
- **Paginated results** — `PaginatedResultAsync` with `.pages()` / `.items()` async generators for multi-page iteration
- **Resource-based namespaces** — `illusts`, `novels`, `users`, `manga`, `ugoira`, `images`
- **Optional MySQL recorder** — `@book000/pixivts-db-mysql` persists every API response via Drizzle ORM

## 📦 Packages

| Package | Description |
|---|---|
| [`@book000/pixivts`](packages/core) | Core API client — zero runtime dependencies, Result-typed, ESM + CJS |
| [`@book000/pixivts-db-mysql`](packages/db-mysql) | Optional MySQL recorder using Drizzle ORM |

## 🚀 Quick Start

```shell
npm install @book000/pixivts
```

### Authentication

```typescript
import { PixivClient } from '@book000/pixivts'

const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!)
console.log(client.userId) // number — authenticated user ID
```

### Fetching a single work

Every method returns `Result<T, PixivError>`. Check `result.isOk` to narrow the
type before accessing `.value` or `.error`.

```typescript
const result = await client.illusts.detail({ illustId: 12345 })
if (result.isOk) {
  console.log(result.value.illust.title)
} else {
  console.error(result.error)
}
```

### Pagination — iterating items

Use `.items()` to lazily stream every item across all pages:

```typescript
for await (const illust of client.illusts.search({ word: 'hatsune miku' }).items()) {
  console.log(illust.id, illust.title)
}

for await (const novel of client.users.bookmarks.novels({ userId: client.userId }).items()) {
  console.log(novel.title)
}
```

Use `.pages()` when you need the raw page object (e.g. to access `next_url`):

```typescript
for await (const page of client.illusts.search({ word: 'hatsune miku' }).pages()) {
  console.log(`page has ${page.illusts.length} illusts`)
}
```

### Enum-like option constants

All option types ship both as `const` objects and as string literal types, so
you can use the enum-like syntax or a plain string — whichever you prefer:

```typescript
import { BookmarkRestrict, RankingMode } from '@book000/pixivts'

// Enum-like (shows up in IDE autocomplete)
await client.illusts.bookmarkAdd({ illustId: 123, restrict: BookmarkRestrict.PUBLIC })
await client.illusts.ranking({ mode: RankingMode.WEEK })

// Plain string — also valid
await client.illusts.bookmarkAdd({ illustId: 123, restrict: 'public' })
```

### Resuming pagination from a saved cursor

Use `parseNextUrl` to extract typed cursor params from `next_url` so you can
resume from a saved position across restarts:

```typescript
import { parseNextUrl } from '@book000/pixivts'

const page = await client.users.bookmarks.illusts({ userId: client.userId })
if (page.isOk && page.value.next_url) {
  const cursor = parseNextUrl(page.value.next_url)
  // Persist cursor.maxBookmarkId, then next time:
  const resumed = await client.users.bookmarks.illusts({
    userId: client.userId,
    maxBookmarkId: cursor.maxBookmarkId,
  })
}
```

## 🔄 Migration from 0.55.1 and earlier

If you are migrating from the previous version of `@book000/pixivts`, see [MIGRATION.md](MIGRATION.md).

## 📚 API Documentation

Full API reference: <https://book000.github.io/pixivts/>

## 📑 License

This project is licensed under the [MIT License](LICENSE)
