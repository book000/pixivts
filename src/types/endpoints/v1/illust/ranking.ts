import {
  OSFilter,
  OSFilterCheck,
  RankingMode,
  RankingModeCheck,
} from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'

/**
 * Request for GET /v1/illust/ranking
 */
export interface GetV1IllustRankingRequest {
  /**
   * Ranking type
   */
  mode: RankingMode

  /**
   * OS filter
   */
  filter: OSFilter

  /**
   * Target date (YYYY-MM-DD. Defaults to today's date if unspecified)
   */
  date?: string

  /**
   * Offset
   */
  offset?: number
}

/**
 * Response for GET /v1/illust/ranking
 */
export interface GetV1IllustRankingResponse {
  /**
   * Illust details
   */
  illusts: PixivIllustItem[]

  /**
   * URL to use for the next request
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string | null
}

export class GetV1IllustRankingCheck extends BaseMultipleCheck<
  GetV1IllustRankingRequest,
  GetV1IllustRankingResponse
> {
  requestChecks(): CheckFunctions<GetV1IllustRankingRequest> {
    return {
      mode: (data) => new RankingModeCheck().throwIfFailed(data.mode),
      filter: (data) => new OSFilterCheck().throwIfFailed(data.filter),
      date: (data) =>
        (typeof data.date === 'string' && this.checkDate(data.date)) ||
        data.date === undefined,
      offset: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.offset === 'number' || data.offset === undefined,
    }
  }

  responseChecks(): CheckFunctions<GetV1IllustRankingResponse> {
    return {
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }

  /**
   * Checks whether the date is in YYYY-MM-DD format
   *
   * @param date The date to check
   * @returns true if it is in YYYY-MM-DD format
   */
  checkDate(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    return regex.test(date)
  }
}
