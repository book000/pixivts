import { RankingMode, RankingModeCheck } from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * Request for GET /v1/novel/ranking
 */
export interface GetV1NovelRankingRequest {
  /**
   * Ranking type
   */
  mode: RankingMode

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
 * Response for GET /v1/novel/ranking
 */
export interface GetV1NovelRankingResponse {
  /**
   * Novel details
   */
  novels: PixivNovelItem[]

  /**
   * URL to use for the next request
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string | null
}

export class GetV1NovelRankingCheck extends BaseMultipleCheck<
  GetV1NovelRankingRequest,
  GetV1NovelRankingResponse
> {
  requestChecks(): CheckFunctions<GetV1NovelRankingRequest> {
    return {
      mode: (data) => new RankingModeCheck().throwIfFailed(data.mode),
      date: (data) =>
        (typeof data.date === 'string' && this.checkDate(data.date)) ||
        data.date === undefined,
      offset: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.offset === 'number' || data.offset === undefined,
    }
  }

  responseChecks(): CheckFunctions<GetV1NovelRankingResponse> {
    return {
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.every((novel) =>
          new PixivNovelItemCheck().throwIfFailed(novel)
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
