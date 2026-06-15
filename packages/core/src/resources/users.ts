/**
 * UserResource — methods for the user API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParams } from '../params'
import { PaginatedResultAsync } from '../paginated'
import type { ResultAsync } from '../result'
import {
  BookmarkRestrict,
  FollowRestrict,
  OSFilter,
  UserIllustType,
} from '../options'
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
} from '../types'

// === Request param types ===

/** Parameters for fetching a user's bookmarked illusts. */
export interface UserBookmarksIllustParams {
  /** ID of the user whose bookmarks to fetch. */
  userId: number
  /** Visibility of the bookmarks to return (default: `"public"`). */
  restrict?: (typeof BookmarkRestrict)[keyof typeof BookmarkRestrict]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Limit results to bookmarks with this tag. */
  tag?: string
  /** Fetch bookmarks older than this bookmark ID (cursor-based pagination). */
  maxBookmarkId?: number
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching a user's bookmarked novels. */
export interface UserBookmarksNovelParams {
  /** ID of the user whose bookmarks to fetch. */
  userId: number
  /** Visibility of the bookmarks to return (default: `"public"`). */
  restrict?: (typeof BookmarkRestrict)[keyof typeof BookmarkRestrict]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Limit results to bookmarks with this tag. */
  tag?: string
  /** Fetch bookmarks older than this bookmark ID (cursor-based pagination). */
  maxBookmarkId?: number
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching a user's detail. */
export interface UserDetailParams {
  /** ID of the user to fetch. */
  userId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
}

/** Parameters for fetching a user's illusts. */
export interface UserIllustsParams {
  /** ID of the user whose illusts to fetch. */
  userId: number
  /** Work type to filter by (omit to return both illusts and manga). */
  type?: (typeof UserIllustType)[keyof typeof UserIllustType]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching a user's novels. */
export interface UserNovelsParams {
  /** ID of the user whose novels to fetch. */
  userId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching a user's following list. */
export interface UserFollowingParams {
  /** ID of the user whose following list to fetch. */
  userId: number
  /** Visibility of the follows to return (default: `"public"`). */
  restrict?: (typeof FollowRestrict)[keyof typeof FollowRestrict]
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for following a user. */
export interface UserFollowAddParams {
  /** ID of the user to follow. */
  userId: number
  /** Visibility of the follow (default: `"public"`). */
  restrict?: (typeof FollowRestrict)[keyof typeof FollowRestrict]
}

/** Parameters for unfollowing a user. */
export interface UserFollowDeleteParams {
  /** ID of the user to unfollow. */
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
   *
   * @example
   * ```ts
   * // Iterate all bookmarked illusts across pages
   * for await (const illust of client.users.bookmarks.illusts({ userId: client.userId }).items()) {
   *   console.log(illust.title)
   * }
   *
   * // Resume from a saved cursor
   * import { parseNextUrl } from '@book000/pixivts'
   * const page = await client.users.bookmarks.illusts({ userId: client.userId })
   * if (page.isOk && page.value.next_url) {
   *   const cursor = parseNextUrl(page.value.next_url)
   *   const next = await client.users.bookmarks.illusts({
   *     userId: client.userId,
   *     maxBookmarkId: cursor.maxBookmarkId,
   *   })
   * }
   * ```
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
   *
   * @example
   * ```ts
   * // Iterate all bookmarked novels across pages
   * for await (const novel of client.users.bookmarks.novels({ userId: client.userId }).items()) {
   *   console.log(novel.title)
   * }
   * ```
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
          maxBookmarkId: params.maxBookmarkId,
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
