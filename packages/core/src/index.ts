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
export type { Result, OkResult, ErrResult } from './result'

// Pagination
export { PaginatedResultAsync, failedPaginated } from './paginated'
export type { PagedResponse } from './paginated'

// Error types
export { rateLimitError, authFailedError, networkError, apiError, PixivFetchError } from './errors'
export type { PixivError } from './errors'

// Interceptor (DB seam)
export type { ResponseRecord, ResponseInterceptor, HttpMethod } from './interceptor'

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
  IllustDetailParams,
  IllustRelatedParams,
  IllustSearchParams,
  IllustRankingParams,
  IllustRecommendedParams,
  IllustSeriesParams,
  IllustBookmarkAddParams,
  IllustBookmarkDeleteParams,
} from './resources/illusts'

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
} from './resources/novels'

export type {
  UserBookmarksIllustParams,
  UserBookmarksNovelParams,
  UserDetailParams,
  UserIllustsParams,
  UserNovelsParams,
  UserFollowingParams,
  UserFollowAddParams,
  UserFollowDeleteParams,
} from './resources/users'

// PixivClient
export { PixivClient } from './client'
export type { PixivClientOptions } from './client'
