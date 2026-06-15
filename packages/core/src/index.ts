/**
 * @book000/pixivts — pixiv Unofficial API Library for TypeScript
 *
 * @example
 * ```ts
 * import { PixivClient } from '@book000/pixivts'
 *
 * const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN)
 * const result = await client.illusts.detail({ illustId: 12345 })
 * if (result.isOk()) console.log(result.value.illust.title)
 * ```
 */

// Result primitives
export { ok, err, ResultAsync } from './result.js'
export type { Result, OkResult, ErrResult } from './result.js'

// Pagination
export { PaginatedResultAsync, failedPaginated } from './paginated.js'
export type { PagedResponse } from './paginated.js'

// Error types
export { rateLimitError, authFailedError, networkError, apiError } from './errors.js'
export type { PixivError } from './errors.js'

// Interceptor (DB seam)
export type { ResponseRecord, ResponseInterceptor, HttpMethod } from './interceptor.js'

// Option types
export type {
  SearchTarget,
  SearchSort,
  SearchDuration,
  RankingMode,
  NovelRankingMode,
  BookmarkRestrict,
  FollowRestrict,
  OSFilter,
  UserIllustType,
} from './options.js'

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
} from './types.js'

// Resource param types
export type {
  IllustDetailParams,
  IllustRelatedParams,
  IllustSearchParams,
  IllustRankingParams,
  IllustRecommendedParams,
  IllustSeriesParams,
  IllustBookmarkAddParams,
  IllustBookmarkDeleteParams,
} from './resources/illusts.js'

export type {
  NovelDetailParams,
  NovelTextParams,
  NovelRelatedParams,
  NovelSearchParams,
  NovelRankingParams,
  NovelRecommendedParams,
  NovelSeriesParams,
  NovelBookmarkAddParams,
  NovelBookmarkDeleteParams,
} from './resources/novels.js'

export type {
  UserBookmarksIllustParams,
  UserBookmarksNovelParams,
  UserDetailParams,
  UserIllustsParams,
  UserNovelsParams,
  UserFollowingParams,
  UserFollowAddParams,
  UserFollowDeleteParams,
} from './resources/users.js'

// PixivClient
export { PixivClient } from './client.js'
export type { PixivClientOptions } from './client.js'
