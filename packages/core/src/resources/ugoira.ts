/**
 * UgoiraResource — methods for the ugoira API namespace.
 */
import type { HttpClient } from '../http.js'
import type { PixivError } from '../errors.js'
import { buildParams } from '../params.js'
import type { ResultAsync } from '../result.js'
import type { UgoiraMetadataResponse } from '../types.js'

/** Parameters for fetching ugoira metadata. */
export interface UgoiraMetadataParams {
  illustId: number
}

/** Methods for the ugoira API namespace. */
export class UgoiraResource {
  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  /**
   * Fetches ugoira metadata (ZIP URL and per-frame timings).
   * GET /v1/ugoira/metadata
   *
   * @param params - Request parameters
   */
  metadata(
    params: UgoiraMetadataParams
  ): ResultAsync<UgoiraMetadataResponse, PixivError> {
    return this.#http.get<UgoiraMetadataResponse>(
      '/v1/ugoira/metadata',
      buildParams({ illustId: params.illustId })
    )
  }
}
