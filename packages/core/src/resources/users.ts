/**
 * UserResource — methods for the user API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParameters } from '../parameters'
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
export interface UserBookmarksIllustParameters {
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
export interface UserBookmarksNovelParameters {
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
export interface UserDetailParameters {
  /** ID of the user to fetch. */
  userId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
}

/** Parameters for fetching a user's illusts. */
export interface UserIllustsParameters {
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
export interface UserNovelsParameters {
  /** ID of the user whose novels to fetch. */
  userId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching a user's following list. */
export interface UserFollowingParameters {
  /** ID of the user whose following list to fetch. */
  userId: number
  /** Visibility of the follows to return (default: `"public"`). */
  restrict?: (typeof FollowRestrict)[keyof typeof FollowRestrict]
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for following a user. */
export interface UserFollowAddParameters {
  /** ID of the user to follow. */
  userId: number
  /** Visibility of the follow (default: `"public"`). */
  restrict?: (typeof FollowRestrict)[keyof typeof FollowRestrict]
}

/** Parameters for unfollowing a user. */
export interface UserFollowDeleteParameters {
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
   * @param parameters - Request parameters
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
   * if (page.isOk && page.value.nextUrl) {
   *   const cursor = parseNextUrl(page.value.nextUrl)
   *   const next = await client.users.bookmarks.illusts({
   *     userId: client.userId,
   *     maxBookmarkId: cursor.maxBookmarkId,
   *   })
   * }
   * ```
   */
  illusts(
    parameters: UserBookmarksIllustParameters
  ): PaginatedResultAsync<UserBookmarksIllustPage, PixivIllustItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserBookmarksIllustPage>(
        '/v1/user/bookmarks/illust',
        buildParameters({
          userId: parameters.userId,
          restrict: parameters.restrict ?? 'public',
          filter: parameters.filter ?? 'for_ios',
          tag: parameters.tag,
          maxBookmarkId: parameters.maxBookmarkId,
          offset: parameters.offset,
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
   * @param parameters - Request parameters
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
    parameters: UserBookmarksNovelParameters
  ): PaginatedResultAsync<UserBookmarksNovelPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserBookmarksNovelPage>(
        '/v1/user/bookmarks/novel',
        buildParameters({
          userId: parameters.userId,
          restrict: parameters.restrict ?? 'public',
          filter: parameters.filter ?? 'for_ios',
          tag: parameters.tag,
          maxBookmarkId: parameters.maxBookmarkId,
          offset: parameters.offset,
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
   * @param parameters - Request parameters
   */
  detail(
    parameters: UserDetailParameters
  ): ResultAsync<UserDetailResponse, PixivError> {
    return this.#http.get<UserDetailResponse>(
      '/v1/user/detail',
      buildParameters({
        userId: parameters.userId,
        filter: parameters.filter ?? 'for_ios',
      })
    )
  }

  /**
   * Fetches illusts posted by a user.
   * GET /v1/user/illusts
   *
   * @param parameters - Request parameters
   */
  illusts(
    parameters: UserIllustsParameters
  ): PaginatedResultAsync<UserIllustsPage, PixivIllustItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserIllustsPage>(
        '/v1/user/illusts',
        buildParameters({
          userId: parameters.userId,
          type: parameters.type,
          filter: parameters.filter ?? 'for_ios',
          offset: parameters.offset,
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
   * @param parameters - Request parameters
   */
  novels(
    parameters: UserNovelsParameters
  ): PaginatedResultAsync<UserNovelsPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserNovelsPage>(
        '/v1/user/novels',
        buildParameters({
          userId: parameters.userId,
          filter: parameters.filter ?? 'for_ios',
          offset: parameters.offset,
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
   * @param parameters - Request parameters
   */
  following(
    parameters: UserFollowingParameters
  ): PaginatedResultAsync<UserFollowingPage, PixivUserPreviewItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<UserFollowingPage>(
        '/v1/user/following',
        buildParameters({
          userId: parameters.userId,
          restrict: parameters.restrict ?? 'public',
          offset: parameters.offset,
        })
      ),
      this.#http,
      (page) => page.userPreviews
    )
  }

  /**
   * Follows a user.
   * POST /v1/user/follow/add
   *
   * @param parameters - Request parameters
   */
  followAdd(
    parameters: UserFollowAddParameters
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParameters({
      userId: parameters.userId,
      restrict: parameters.restrict ?? 'public',
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
   * @param parameters - Request parameters
   */
  followDelete(
    parameters: UserFollowDeleteParameters
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParameters({ userId: String(parameters.userId) })
    return this.#http.post<Record<string, never>>(
      '/v1/user/follow/delete',
      body.toString()
    )
  }
}
