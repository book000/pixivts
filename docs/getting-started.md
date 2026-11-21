# Getting Started

## Installation

```shell
npm install @book000/pixivts
# or
pnpm add @book000/pixivts
```

## Authentication

Create a client by passing your pixiv refresh token. `PixivClient.of` performs the initial token exchange and stores the access token internally. After that, a 401 response triggers one automatic token refresh and a single retry of the request.

`PixivClient.of` rejects with a `PixivAuthError` (an `Error` subclass exposing `status`, `code` and `body`) when the token endpoint does not return HTTP 200, for example `invalid_grant` for a revoked refresh token.

```typescript
import { PixivClient } from '@book000/pixivts'

const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!)

// Authenticated user ID (number)
console.log(client.userId)
```

## Result type

Every API method returns `Result<T, PixivError>` (awaitable) instead of throwing for API-level errors. Check `result.isOk` to narrow the union before accessing `.value` or `.error`:

```typescript
const result = await client.illusts.detail({ illustId: 12345 })

if (result.isOk) {
  console.log(result.value.illust.title) // IntelliSense shows .value here
} else {
  console.error(result.error)            // IntelliSense shows .error here
}
```

`PixivError` is a union discriminated by `type`: `rate_limit`, `auth_failed`, `network`, `api_error` and `parse_error`. The `.pages()` and `.items()` generators of paginated results (see [Pagination](pagination.md)) throw a `PixivFetchError` instead, because a generator cannot return a `Result`.

You can also use the chainable helpers:

```typescript
const title = await client.illusts.detail({ illustId: 12345 })
  .map((res) => res.illust.title)
  .unwrapOr('(unknown)')
```
