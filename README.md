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

```typescript
import { PixivClient } from '@book000/pixivts'

const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!)

const result = await client.illusts.detail({ illustId: 12345 })
if (result.isOk) {
  console.log(result.value.illust.title)
}

// Iterate over all pages
for await (const page of client.illusts.search({ word: 'hatsune miku' }).pages()) {
  for (const illust of page.illusts) {
    console.log(illust.id, illust.title)
  }
}
```

## 🔄 Migration from v0.55.1 and earlier

If you are migrating from the previous version of `@book000/pixivts`, see [MIGRATION.md](MIGRATION.md).

## 📚 API Documentation

Full API reference: <https://book000.github.io/pixivts/>

## 📑 License

This project is licensed under the [MIT License](LICENSE)
