/**
 * UgoiraResource — methods for the ugoira API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParameters } from '../parameters'
import type { ResultAsync } from '../result'
import type { UgoiraMetadataResponse } from '../types'

/** Parameters for fetching ugoira metadata. */
export interface UgoiraMetadataParameters {
  /** ID of the ugoira illust whose metadata to fetch. */
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
   * @param parameters - Request parameters
   */
  metadata(
    parameters: UgoiraMetadataParameters
  ): ResultAsync<UgoiraMetadataResponse, PixivError> {
    return this.#http.get<UgoiraMetadataResponse>(
      '/v1/ugoira/metadata',
      buildParameters({ illustId: parameters.illustId })
    )
  }
}
