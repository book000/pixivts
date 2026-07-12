/**
 * @book000/pixivts — pixiv Unofficial API Library for TypeScript
 *
 * @example
 * ```ts
 * import { PixivClient } from '@book000/pixivts'
 *
 * const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN)
 * const result = await client.illusts.detail({ illustId: 12345 })
 * if (result.isOk) console.log(result.value.illust.title)
 * ```
 */

// Result primitives
export { ok, err, ResultAsync } from './result'
export type { Result, OkResult, ErrorResult } from './result'
// eslint-disable-next-line @typescript-eslint/no-deprecated -- re-exporting the deprecated alias itself for backward compatibility, not using it
export type { ErrResult } from './result'

// Pagination
export { PaginatedResultAsync, failedPaginated } from './paginated'
export type { PagedResponse } from './paginated'

// URL utilities
export { parseNextUrl } from './parameters'
export type { ParsedNextUrl } from './parameters'

// Error types
export {
  rateLimitError,
  authFailedError,
  networkError,
  apiError,
  PixivFetchError,
} from './errors'
export type { PixivError } from './errors'

// Interceptor (DB seam)
export type {
  ResponseRecord,
  ResponseInterceptor,
  HttpMethod,
} from './interceptor'

// Option constants and types (exported as values so callers can use e.g. BookmarkRestrict.PUBLIC)
export {
  SearchTarget,
  SearchSort,
  SearchDuration,
  RankingMode,
  NovelRankingMode,
  BookmarkRestrict,
  FollowRestrict,
  OSFilter,
  UserIllustType,
} from './options'

// Public API types (zod stripped at runtime — see types.ts)
export type {
  ImageUrls,
  ProfileImageUrls,
  PixivUser,
  Tag,
  Series,
  PrivacyPolicy,
  PixivIllustItem,
  MetaSinglePage,
  MetaPages,
  IllustSeriesDetail,
  PixivNovelItem,
  NovelSeriesDetail,
  PixivUserItem,
  PixivUserProfile,
  PixivUserProfilePublicity,
  PixivUserProfileWorkspace,
  PixivUserPreviewItem,
  ZipUrls,
  Frame,
  PixivUgoiraItem,
  PixivApiErrorBody,
  // Response types for API endpoints
  IllustDetailResponse,
  IllustListPage,
  IllustRecommendedPage,
  IllustSeriesPage,
  MangaRecommendedPage,
  UgoiraMetadataResponse,
  NovelDetailResponse,
  NovelListPage,
  NovelRecommendedPage,
  NovelSeriesPage,
  UserDetailResponse,
  UserIllustsPage,
  UserNovelsPage,
  UserBookmarksIllustPage,
  UserBookmarksNovelPage,
  UserFollowingPage,
} from './types'

// Resource param types
export type {
  IllustDetailParameters,
  IllustRelatedParameters,
  IllustSearchParameters,
  IllustRankingParameters,
  IllustRecommendedParameters,
  IllustSeriesParameters,
  IllustBookmarkAddParameters,
  IllustBookmarkDeleteParameters,
} from './resources/illusts'

export type {
  NovelDetailParameters,
  NovelTextParameters,
  NovelRelatedParameters,
  NovelSearchParameters,
  NovelRankingParameters,
  NovelRecommendedParameters,
  NovelSeriesParameters,
  NovelBookmarkAddParameters,
  NovelBookmarkDeleteParameters,
} from './resources/novels'

export type {
  UserBookmarksIllustParameters,
  UserBookmarksNovelParameters,
  UserDetailParameters,
  UserIllustsParameters,
  UserNovelsParameters,
  UserFollowingParameters,
  UserFollowAddParameters,
  UserFollowDeleteParameters,
} from './resources/users'

// Deprecated aliases for the resource param types above, kept for backward
// compatibility with the pre-1.x `*Params` naming (renamed to `*Parameters`
// to satisfy the `unicorn/name-replacements` lint rule).
export type {
  IllustDetailParameters as IllustDetailParams,
  IllustRelatedParameters as IllustRelatedParams,
  IllustSearchParameters as IllustSearchParams,
  IllustRankingParameters as IllustRankingParams,
  IllustRecommendedParameters as IllustRecommendedParams,
  IllustSeriesParameters as IllustSeriesParams,
  IllustBookmarkAddParameters as IllustBookmarkAddParams,
  IllustBookmarkDeleteParameters as IllustBookmarkDeleteParams,
} from './resources/illusts'

export type {
  NovelDetailParameters as NovelDetailParams,
  NovelTextParameters as NovelTextParams,
  NovelRelatedParameters as NovelRelatedParams,
  NovelSearchParameters as NovelSearchParams,
  NovelRankingParameters as NovelRankingParams,
  NovelRecommendedParameters as NovelRecommendedParams,
  NovelSeriesParameters as NovelSeriesParams,
  NovelBookmarkAddParameters as NovelBookmarkAddParams,
  NovelBookmarkDeleteParameters as NovelBookmarkDeleteParams,
} from './resources/novels'

export type {
  UserBookmarksIllustParameters as UserBookmarksIllustParams,
  UserBookmarksNovelParameters as UserBookmarksNovelParams,
  UserDetailParameters as UserDetailParams,
  UserIllustsParameters as UserIllustsParams,
  UserNovelsParameters as UserNovelsParams,
  UserFollowingParameters as UserFollowingParams,
  UserFollowAddParameters as UserFollowAddParams,
  UserFollowDeleteParameters as UserFollowDeleteParams,
} from './resources/users'

// PixivClient
export { PixivClient } from './client'
export type { PixivClientOptions } from './client'
