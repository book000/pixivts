/**
 * UserResource — methods for the user API namespace.
 */
import type { HttpClient } from '../http.js'
import type { PixivError } from '../errors.js'
import { buildParams } from '../params.js'
import { PaginatedResultAsync } from '../paginated.js'
import type { ResultAsync } from '../result.js'
import type {
  BookmarkRestrict,
  FollowRestrict,
  OSFilter,
  UserIllustType,
} from '../options.js'
import type {
  PixivIllustItem,
  PixivNovelItem,
  PixivUserPreviewItem,
  UserBookmarksIllustPage,
  UserBookmarksNovelPage,
  UserDetailResponse,
  UserFollowingPage,
  UserIllustsPage,
  UserNovelsPage,
} from '../types.js'

// === Request param types ===

/** Parameters for fetching a user's bookmarked illusts. */
export interface UserBookmarksIllustParams {
  userId: number
  restrict?: BookmarkRestrict
  filter?: OSFilter
  tag?: string
  maxBookmarkId?: number
  offset?: number
}

/** Parameters for fetching a user's bookmarked novels. */
export interface UserBookmarksNovelParams {
  userId: number
  restrict?: BookmarkRestrict
  filter?: OSFilter
  tag?: string
  offset?: number
}

/** Parameters for fetching a user's detail. */
export interface UserDetailParams {
  userId: number
  filter?: OSFilter
}

/** Parameters for fetching a user's illusts. */
export interface UserIllustsParams {
  userId: number
  type?: UserIllustType
  filter?: OSFilter
  offset?: number
}

/** Parameters for fetching a user's novels. */
export interface UserNovelsParams {
  userId: number
  filter?: OSFilter
  offset?: number
}

/** Parameters for fetching a user's following list. */
export interface UserFollowingParams {
  userId: number
  restrict?: FollowRestrict
  offset?: number
}

/** Parameters for following a user. */
export interface UserFollowAddParams {
  userId: number
  restrict?: FollowRestrict
}

/** Parameters for unfollowing a user. */
export interface UserFollowDeleteParams {
  userId: number
}

/** Methods for the user bookmarks sub-namespace. */
export class UserBookmarksResource {
  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  /**
   * Fetches a user's bookmarked illusts.
   * GET /v1/user/bookmarks/illust
   *
   * @param params - Request parameters
   */
  illusts(
    params: UserBookmarksIllustParams
  ): PaginatedResultAsync<UserBookmarksIllustPage, PixivIllustItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserBookmarksIllustPage>(
        '/v1/user/bookmarks/illust',
        buildParams({
          userId: params.userId,
          restrict: params.restrict ?? 'public',
          filter: params.filter ?? 'for_ios',
          tag: params.tag,
          maxBookmarkId: params.maxBookmarkId,
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }

  /**
   * Fetches a user's bookmarked novels.
   * GET /v1/user/bookmarks/novel
   *
   * @param params - Request parameters
   */
  novels(
    params: UserBookmarksNovelParams
  ): PaginatedResultAsync<UserBookmarksNovelPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserBookmarksNovelPage>(
        '/v1/user/bookmarks/novel',
        buildParams({
          userId: params.userId,
          restrict: params.restrict ?? 'public',
          filter: params.filter ?? 'for_ios',
          tag: params.tag,
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.novels
    )
  }
}

/** Methods for the user API namespace. */
export class UserResource {
  /** User bookmarks sub-namespace. */
  readonly bookmarks: UserBookmarksResource

  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
    this.bookmarks = new UserBookmarksResource(http)
  }

  /**
   * Fetches detailed profile information for a user.
   * GET /v1/user/detail
   *
   * @param params - Request parameters
   */
  detail(
    params: UserDetailParams
  ): ResultAsync<UserDetailResponse, PixivError> {
    return this.#http.get<UserDetailResponse>(
      '/v1/user/detail',
      buildParams({ userId: params.userId, filter: params.filter ?? 'for_ios' })
    )
  }

  /**
   * Fetches illusts posted by a user.
   * GET /v1/user/illusts
   *
   * @param params - Request parameters
   */
  illusts(
    params: UserIllustsParams
  ): PaginatedResultAsync<UserIllustsPage, PixivIllustItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserIllustsPage>(
        '/v1/user/illusts',
        buildParams({
          userId: params.userId,
          type: params.type,
          filter: params.filter ?? 'for_ios',
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }

  /**
   * Fetches novels posted by a user.
   * GET /v1/user/novels
   *
   * @param params - Request parameters
   */
  novels(
    params: UserNovelsParams
  ): PaginatedResultAsync<UserNovelsPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserNovelsPage>(
        '/v1/user/novels',
        buildParams({
          userId: params.userId,
          filter: params.filter ?? 'for_ios',
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.novels
    )
  }

  /**
   * Fetches the list of users that a user is following.
   * GET /v1/user/following
   *
   * @param params - Request parameters
   */
  following(
    params: UserFollowingParams
  ): PaginatedResultAsync<UserFollowingPage, PixivUserPreviewItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserFollowingPage>(
        '/v1/user/following',
        buildParams({
          userId: params.userId,
          restrict: params.restrict ?? 'public',
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.user_previews
    )
  }

  /**
   * Follows a user.
   * POST /v1/user/follow/add
   *
   * @param params - Request parameters
   */
  followAdd(
    params: UserFollowAddParams
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParams({
      userId: params.userId,
      restrict: params.restrict ?? 'public',
    })
    return this.#http.post<Record<string, never>>(
      '/v1/user/follow/add',
      body.toString()
    )
  }

  /**
   * Unfollows a user.
   * POST /v1/user/follow/delete
   *
   * @param params - Request parameters
   */
  followDelete(
    params: UserFollowDeleteParams
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParams({ userId: String(params.userId) })
    return this.#http.post<Record<string, never>>(
      '/v1/user/follow/delete',
      body.toString()
    )
  }
}
