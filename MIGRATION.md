# Migration Guide: v1 → v2

Version 2 is a **breaking rewrite**. This guide maps v1 patterns to v2 equivalents.

## Package Structure

v1 was a single package. v2 is a pnpm monorepo with two packages:

| v1 | v2 |
|---|---|
| `@book000/pixivts` (axios-based, CJS) | `@book000/pixivts` (fetch-based, ESM+CJS) |
| `saving-responses/` (TypeORM + MySQL built-in) | `@book000/pixivts-db-mysql` (optional, Drizzle + MySQL) |

## Creating a Client

```typescript
// v1
import { Pixiv } from '@book000/pixivts'
const pixiv = await Pixiv.of(refreshToken)

// v2
import { PixivClient } from '@book000/pixivts'
const client = await PixivClient.of(refreshToken)
```

## Error Handling

v1 threw errors on failure. v2 returns `Result<T, PixivError>` — no thrown exceptions.

```typescript
// v1
try {
  const res = await pixiv.illustDetail({ illustId })
  console.log(res.data.illust.title)
} catch (err) {
  console.error(err)
}

// v2
const result = await client.illusts.detail({ illustId })
if (result.isOk) {
  console.log(result.value.illust.title)
} else {
  console.error(result.error.type)
}
```

## Method Mapping

| v1 method | v2 method |
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
| `pixiv.novelSeries({ novelSeriesId })` | `client.novels.series({ novelSeriesId })` |
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

v1 returned the raw API response including `next_url`. v2 provides a `PaginatedResultAsync` with async generators.

```typescript
// v1
let nextUrl: string | null = null
do {
  const res = await pixiv.searchIllust({ word: 'hatsune miku', nextUrl })
  // process res.data.illusts
  nextUrl = res.data.next_url
} while (nextUrl)

// v2 — iterate pages
for await (const page of client.illusts.search({ word: 'hatsune miku' }).pages()) {
  // process page.illusts
}

// v2 — iterate all items across pages (async generator — throws on fetch error)
for await (const illust of client.illusts.search({ word: 'hatsune miku' }).items()) {
  console.log(illust) // IllustSimple
}
```

## Response Type

v1 returned `AxiosResponse<T>` — you accessed data via `.data`. v2 returns the unwrapped response body directly.

```typescript
// v1
const res = await pixiv.illustDetail({ illustId })
console.log(res.data.illust.title)  // .data because it's AxiosResponse

// v2
const result = await client.illusts.detail({ illustId })
if (result.isOk) {
  console.log(result.value.illust.title)  // no .data — value is the response body
}
```

## MySQL Response Saving

v1 had response saving built into the core package via TypeORM. v2 moves this to the optional `@book000/pixivts-db-mysql` package using Drizzle ORM.

```typescript
// v1
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

// v2
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

The following dependencies from v1 are no longer required:

| Removed | Reason |
|---|---|
| `axios` | Replaced by native `fetch` |
| `qs` | Replaced by `URLSearchParams` |
| `typeorm` | Moved to `@book000/pixivts-db-mysql` (Drizzle) |
| `typeorm-naming-strategies` | Same as above |
| `snake-camel-types` | Replaced by local type utilities |
| `reflect-metadata` | TypeORM no longer used in core |
