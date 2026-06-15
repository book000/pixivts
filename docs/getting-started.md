# Getting Started

## Installation

```shell
npm install @book000/pixivts
# or
pnpm add @book000/pixivts
```

## Authentication

Create a client by passing your Pixiv refresh token.
`PixivClient.of` performs the initial token exchange and stores the access
token internally — subsequent calls refresh it automatically on 401.

```typescript
import { PixivClient } from '@book000/pixivts'

const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!)

// Authenticated user ID (number)
console.log(client.userId)
```

## Result type

Every API method returns `Result<T, PixivError>` — there are no thrown
exceptions for API-level errors.
Check `result.isOk` to narrow the union before accessing `.value` or `.error`:

```typescript
const result = await client.illusts.detail({ illustId: 12345 })

if (result.isOk) {
  console.log(result.value.illust.title) // IntelliSense shows .value here
} else {
  console.error(result.error)            // IntelliSense shows .error here
}
```

You can also use the chainable helpers:

```typescript
const title = await client.illusts.detail({ illustId: 12345 })
  .map((res) => res.illust.title)
  .unwrapOr('(unknown)')
```
