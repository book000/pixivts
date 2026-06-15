/**
 * PixivClient — main entry point for the @book000/pixivts library.
 *
 * @example
 * ```ts
 * const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!)
 * const result = await client.illusts.detail({ illustId: 12345 })
 * if (result.isOk) console.log(result.value.illust.title)
 * ```
 */

import { AuthManager } from './auth'
import { HttpClient } from './http'
import type { ResponseInterceptor } from './interceptor'
import type { RateLimitRetryOptions } from './http'
import { IllustResource } from './resources/illusts'
import { NovelResource } from './resources/novels'
import { UserResource } from './resources/users'
import { MangaResource } from './resources/manga'
import { UgoiraResource } from './resources/ugoira'
import { ImageResource } from './resources/images'

/** Options for constructing a {@link PixivClient}. */
export interface PixivClientOptions {
  /** Rate-limit retry configuration. */
  retry?: Partial<RateLimitRetryOptions>
  /** Optional interceptor called after each successful response (DB seam). */
  onResponse?: ResponseInterceptor
}

/**
 * Main client for the pixiv API.
 *
 * Create an instance via {@link PixivClient.of} — the constructor is private
 * because initialisation requires an async token refresh.
 */
export class PixivClient {
  /** Illust API namespace. */
  readonly illusts: IllustResource
  /** Novel API namespace. */
  readonly novels: NovelResource
  /** User API namespace. */
  readonly users: UserResource
  /** Manga API namespace. */
  readonly manga: MangaResource
  /** Ugoira API namespace. */
  readonly ugoira: UgoiraResource
  /** Image fetch helpers. */
  readonly images: ImageResource

  readonly #auth: AuthManager

  private constructor(auth: AuthManager, http: HttpClient) {
    this.#auth = auth
    this.illusts = new IllustResource(http)
    this.novels = new NovelResource(http)
    this.users = new UserResource(http)
    this.manga = new MangaResource(http)
    this.ugoira = new UgoiraResource(http)
    this.images = new ImageResource(http)
  }

  /**
   * Numeric user ID of the authenticated account.
   *
   * Available immediately after {@link PixivClient.of} resolves.
   * The pixiv OAuth endpoint returns the ID as a string; this getter
   * normalises it to `number` for consistency with resource method params
   * (e.g. `UserBookmarksIllustParams.userId`).
   *
   * @example
   * ```ts
   * const client = await PixivClient.of(refreshToken)
   * const bookmarks = await client.users.bookmarks.illusts({ userId: client.userId })
   * ```
   */
  get userId(): number {
    const id = Number(this.#auth.userId)
    if (Number.isNaN(id)) {
      throw new TypeError(`Invalid userId: "${this.#auth.userId}"`)
    }
    return id
  }

  /**
   * Returns the current OAuth access token.
   *
   * The access token is short-lived and changes after each call to
   * {@link PixivClient.of} and after each automatic token refresh triggered
   * by a 401 response.
   *
   * @returns The current bearer access token string
   */
  getAccessToken(): string {
    return this.#auth.accessToken
  }

  /**
   * Returns the current OAuth refresh token.
   *
   * The refresh token is long-lived and is used to obtain new access tokens.
   * It may rotate after a successful token refresh.
   *
   * @returns The current refresh token string
   */
  getRefreshToken(): string {
    return this.#auth.refreshToken
  }

  /**
   * Creates a PixivClient by refreshing the given token.
   *
   * @param refreshToken - Pixiv refresh token
   * @param options - Optional retry and response interceptor configuration
   * @returns A fully initialised {@link PixivClient}
   */
  static async of(
    refreshToken: string,
    options?: PixivClientOptions
  ): Promise<PixivClient> {
    const auth = await AuthManager.login(refreshToken)
    const http = new HttpClient(auth, options)
    return new PixivClient(auth, http)
  }
}
