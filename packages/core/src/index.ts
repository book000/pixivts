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

// URL utilities
export { parseNextUrl } from './params'
export type { ParsedNextUrl } from './params'

// Error types
export {
  rateLimitError,
  authFailedError,
  networkError,
  apiError,
  parseError,
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
  NovelComment,
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
  IllustComment,
  IllustCommentStamp,
  IllustRequest,
  IllustRequestInfo,
  IllustRequestCollaborateStatus,
  IllustRequestCollaborateUserSample,
  IllustRequestUser,
  BookmarkDetailTag,
  BookmarkDetail,
  // Response types for API endpoints
  IllustDetailResponse,
  IllustListPage,
  IllustRecommendedPage,
  IllustSeriesPage,
  IllustCommentRepliesPage,
  IllustCommentsPage,
  IllustBookmarkDetailResponse,
  TrendingTagIllust,
  TrendingTagsIllustResponse,
  TrendingTagsNovelResponse,
  IllustPopularPreviewResponse,
  NovelPopularPreviewResponse,
  MangaRecommendedPage,
  WatchlistSeries,
  WatchlistMangaPage,
  WatchlistNovelPage,
  NovelMarker,
  MarkedNovel,
  NovelMarkersPage,
  SpotlightArticle,
  SpotlightArticlesPage,
  UgoiraMetadataResponse,
  NovelDetailResponse,
  NovelListPage,
  NovelRecommendedPage,
  NovelSeriesPage,
  NovelCommentRepliesPage,
  NovelCommentsPage,
  WebviewNovelRating,
  WebviewNovelNavigationInfo,
  WebviewNovelSeriesNavigation,
  WebviewNovel,
  UserDetailResponse,
  UserDetailV2Response,
  PixivUserProfileV2,
  PixivUserProfileBadge,
  PixivUserProfilePublicityV2,
  PixivUserProfileWorkspaceV2,
  UserIllustsPage,
  UserNovelsPage,
  UserBookmarksIllustPage,
  UserBookmarksNovelPage,
  UserFollowingPage,
  UserRelatedPage,
  UserRecommendedPage,
  UserFollowerPage,
  UserMypixivPage,
  UserSearchPage,
  UserListPage,
  BookmarkTag,
  UserBookmarkTagsIllustPage,
  AiShowSettingsResponse,
  RestrictedModeSettingsResponse,
  MutedTag,
  MuteListResponse,
  UserMeState,
  UserMeProfile,
  UserMeStateResponse,
  HasUnreadNotificationsResponse,
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
  IllustFollowParams,
  IllustMypixivParams,
  IllustCommentRepliesParams,
  IllustCommentsParams,
  IllustBookmarkDetailParams,
  IllustNewParams,
  IllustTrendingTagsParams,
  IllustPopularPreviewParams,
} from './resources/illusts'

export type {
  NovelDetailParams,
  NovelTextParams,
  NovelRelatedParams,
  NovelSearchParams,
  NovelRankingParams,
  NovelRecommendedParams,
  NovelViewedEntry,
  NovelSeriesParams,
  NovelBookmarkAddParams,
  NovelBookmarkDeleteParams,
  NovelFollowParams,
  NovelMypixivParams,
  NovelCommentRepliesParams,
  NovelCommentsParams,
  NovelNewParams,
  NovelPopularPreviewParams,
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
  UserRelatedParams,
  UserRecommendedParams,
  UserFollowerParams,
  UserMypixivParams,
  UserListParams,
  UserBookmarkTagsIllustParams,
  UserEditAiShowSettingsParams,
  UserSearchParams,
} from './resources/users'

export type { SpotlightArticlesParams } from './resources/spotlight'

// PixivClient
export { PixivClient } from './client'
export type { PixivClientOptions } from './client'
