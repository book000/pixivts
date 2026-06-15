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
```

## 📖 Documentation

- **[Getting Started](docs/getting-started.md)** — authentication, Result type, error handling
- **[Pagination](docs/pagination.md)** — `.items()` / `.pages()`, cursor-based resume
- **[Option Constants](docs/options.md)** — enum-like `BookmarkRestrict.PUBLIC` etc.
- **[MySQL Recorder](docs/db-mysql.md)** — `@book000/pixivts-db-mysql` setup and query helpers
- **[Migration Guide](docs/migration.md)** — migrating from ≤ 0.55.1 to ≥ 0.56.2
- **[API Reference](https://book000.github.io/pixivts/)** — full TypeDoc reference

## 📑 License

This project is licensed under the [MIT License](LICENSE)
