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

  private constructor(http: HttpClient) {
    this.illusts = new IllustResource(http)
    this.novels = new NovelResource(http)
    this.users = new UserResource(http)
    this.manga = new MangaResource(http)
    this.ugoira = new UgoiraResource(http)
    this.images = new ImageResource(http)
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
    return new PixivClient(http)
  }
}
