/**
 * UgoiraResource — methods for the ugoira API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParams } from '../params'
import type { ResultAsync } from '../result'
import type { UgoiraMetadataResponse } from '../types'

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
