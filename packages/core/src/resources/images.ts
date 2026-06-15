/**
 * ImageResource — helpers for fetching pixiv CDN images.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import type { ResultAsync } from '../result'

/** Methods for fetching pixiv images. */
export class ImageResource {
  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  /**
   * Fetches a pixiv image.
   *
   * Uses a browser User-Agent and Referer (required for pixiv CDN).
   * No Authorization header is sent.
   *
   * @param imageUrl - Full CDN image URL
   */
  fetch(imageUrl: string): ResultAsync<Response, PixivError> {
    return this.#http.fetchImage(imageUrl)
  }
}
