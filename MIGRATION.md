# Migration Guide: ≤ 0.55.1 → ≥ 0.56.2

Version 0.56.2 is a **breaking rewrite**. This guide maps patterns from 0.55.1 and earlier to the current API.

## Package Structure

The previous version was a single package. The current version is a pnpm monorepo with two packages:

| ≤ 0.55.1 | ≥ 0.56.2 |
|---|---|
| `@book000/pixivts` (fetch-based, CJS) | `@book000/pixivts` (fetch-based, ESM+CJS) |
| `saving-responses/` (TypeORM + MySQL built-in) | `@book000/pixivts-db-mysql` (optional, Drizzle + MySQL) |

## Creating a Client

```typescript
// ≤ 0.55.1
import { Pixiv } from '@book000/pixivts'
const pixiv = await Pixiv.of(refreshToken)

// ≥ 0.56.2
import { PixivClient } from '@book000/pixivts'
const client = await PixivClient.of(refreshToken)
```

## Error Handling

The previous version threw errors on failure. The current version returns `Result<T, PixivError>` — no thrown exceptions.

```typescript
// ≤ 0.55.1
try {
  const res = await pixiv.illustDetail({ illustId })
  console.log(res.data.illust.title)
} catch (err) {
  console.error(err)
}

// ≥ 0.56.2
const result = await client.illusts.detail({ illustId })
if (result.isOk) {
  console.log(result.value.illust.title)
} else {
  console.error(result.error.type)
}
```

## Method Mapping

| ≤ 0.55.1 method | ≥ 0.56.2 method |
|---|---|
| `pixiv.illustDetail({ illustId })` | `client.illusts.detail({ illustId })` |
| `pixiv.illustRelated({ illustId })` | `client.illusts.related({ illustId })` |
| `pixiv.searchIllust({ word })` | `client.illusts.search({ word })` |
| `pixiv.illustRanking(opts)` | `client.illusts.ranking(opts)` |
| `pixiv.illustRecommended(opts)` | `client.illusts.recommended(opts)` |
| `pixiv.illustSeries({ illustSeriesId })` | `client.illusts.series({ illustSeriesId })` |
| `pixiv.illustBookmarkAdd(opts)` | `client.illusts.bookmarkAdd(opts)` |
| `pixiv.illustBookmarkDelete(opts)` | `client.illusts.bookmarkDelete(opts)` |
| `pixiv.novelDetail({ novelId })` | `client.novels.detail({ novelId })` |
| `pixiv.novelText({ novelId })` | `client.novels.text({ novelId })` |
| `pixiv.novelRelated({ novelId })` | `client.novels.related({ novelId })` |
| `pixiv.searchNovel({ word })` | `client.novels.search({ word })` |
| `pixiv.novelRanking(opts)` | `client.novels.ranking(opts)` |
| `pixiv.novelRecommended(opts)` | `client.novels.recommended(opts)` |
| `pixiv.novelSeries({ seriesId })` | `client.novels.series({ seriesId })` |
| `pixiv.novelBookmarkAdd(opts)` | `client.novels.bookmarkAdd(opts)` |
| `pixiv.novelBookmarkDelete(opts)` | `client.novels.bookmarkDelete(opts)` |
| `pixiv.userDetail({ userId })` | `client.users.detail({ userId })` |
| `pixiv.userIllusts({ userId })` | `client.users.illusts({ userId })` |
| `pixiv.userNovels({ userId })` | `client.users.novels({ userId })` |
| `pixiv.userFollowing(opts)` | `client.users.following(opts)` |
| `pixiv.userFollowAdd(opts)` | `client.users.followAdd(opts)` |
| `pixiv.userFollowDelete(opts)` | `client.users.followDelete(opts)` |
| `pixiv.userBookmarksIllust(opts)` | `client.users.bookmarks.illusts(opts)` |
| `pixiv.userBookmarksNovel(opts)` | `client.users.bookmarks.novels(opts)` |
| `pixiv.mangaRecommended(opts)` | `client.manga.recommended(opts)` |
| `pixiv.ugoiraMetadata({ illustId })` | `client.ugoira.metadata({ illustId })` |
| `pixiv.getImageStream(url)` | `client.images.fetch(url)` |

## Pagination

The previous version returned the raw API response including `next_url`. The current version provides a `PaginatedResultAsync` with async generators.

```typescript
// ≤ 0.55.1
let offset = 0
while (true) {
  const res = await pixiv.searchIllust({ word: 'hatsune miku', offset })
  // process res.data.illusts
  if (!res.data.next_url) break
  offset += res.data.illusts.length
}

// ≥ 0.56.2 — iterate pages
for await (const page of client.illusts.search({ word: 'hatsune miku' }).pages()) {
  // process page.illusts
}

// ≥ 0.56.2 — iterate all items across pages (async generator — throws on fetch error)
for await (const illust of client.illusts.search({ word: 'hatsune miku' }).items()) {
  console.log(illust) // IllustSimple
}
```

## Response Type

The previous version returned a custom `PixivApiResponse<T>` — you accessed the body via `.data`. The current version returns the unwrapped response body directly.

```typescript
// ≤ 0.55.1
const res = await pixiv.illustDetail({ illustId })
console.log(res.data.illust.title)  // .data because it's PixivApiResponse<T>

// ≥ 0.56.2
const result = await client.illusts.detail({ illustId })
if (result.isOk) {
  console.log(result.value.illust.title)  // no .data — value is the response body
}
```

## MySQL Response Saving

The previous version had response saving built into the core package via TypeORM. The current version moves this to the optional `@book000/pixivts-db-mysql` package using Drizzle ORM.

```typescript
// ≤ 0.55.1
import { Pixiv } from '@book000/pixivts'
const pixiv = await Pixiv.of(refreshToken, {
  responseDatabase: {
    host: 'localhost',
    username: 'pixiv',
    password: 'secret',
    database: 'pixivts',
    synchronize: true,
  },
})

// ≥ 0.56.2
import { PixivClient } from '@book000/pixivts'
import { createResponseRecorder } from '@book000/pixivts-db-mysql'

const { interceptor, close } = await createResponseRecorder({
  host: 'localhost',
  user: 'pixiv',
  password: 'secret',
  database: 'pixivts',
  bootstrap: true,
})
const client = await PixivClient.of(refreshToken, { onResponse: interceptor })
// ... use client ...
await close()
```

## Dependencies Removed

The following dependencies from ≤ 0.55.1 are no longer required:

| Removed | Reason |
|---|---|
| `qs` | Replaced by `URLSearchParams` |
| `typeorm` | Moved to `@book000/pixivts-db-mysql` (Drizzle) |
| `typeorm-naming-strategies` | Same as above |
| `snake-camel-types` | Replaced by local type utilities |
