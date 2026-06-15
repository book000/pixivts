# Pagination

List endpoints return `PaginatedResultAsync`, which extends `ResultAsync` and
adds two async generators.

## `.items()` — stream every item across all pages

```typescript
for await (const illust of client.illusts.search({ word: 'hatsune miku' }).items()) {
  console.log(illust.id, illust.title)
}

for await (const novel of client.users.bookmarks.novels({ userId: client.userId }).items()) {
  console.log(novel.title)
}
```

## `.pages()` — access the raw page object

Use this when you need page-level metadata such as `next_url`:

```typescript
for await (const page of client.illusts.search({ word: 'hatsune miku' }).pages()) {
  console.log(`page has ${page.illusts.length} illusts`)
}
```

## Awaiting the first page directly

`PaginatedResultAsync` is also directly `await`-able and returns only the
first page as a `Result`:

```typescript
const page = await client.illusts.search({ word: 'cat' })
if (page.isOk) {
  console.log(page.value.illusts.length)
}
```

## Resuming from a saved cursor

Use `parseNextUrl` to extract typed cursor parameters from `next_url` so you
can persist a position and resume across restarts.

```typescript
import { parseNextUrl } from '@book000/pixivts'

const page = await client.users.bookmarks.illusts({ userId: client.userId })
if (page.isOk && page.value.next_url) {
  const cursor = parseNextUrl(page.value.next_url)
  // cursor.maxBookmarkId is number | undefined — persist this value

  // Next run: pass the saved cursor back
  const resumed = await client.users.bookmarks.illusts({
    userId: client.userId,
    maxBookmarkId: cursor.maxBookmarkId,
  })
}
```

### Available cursor fields

`ParsedNextUrl` contains only the pagination cursor fields (not the full
query string). All fields are `number | undefined`.

| Field | Endpoint |
|---|---|
| `maxBookmarkId` | `GET /v1/user/bookmarks/illust` |
| `maxBookmarkIdForRecommend` | `GET /v1/illust/recommended`, `GET /v1/novel/recommended` |
| `minBookmarkIdForRecentIllust` | `GET /v1/illust/recommended` |
| `offset` | search, ranking, recommended, user lists, … |
| `lastOrder` | `GET /v2/novel/series` |
