import {
  OSFilter,
  OSFilterCheck,
  RankingMode,
  RankingModeCheck,
} from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'

/**
 * GET /v1/illust/ranking のリクエスト
 */
export interface GetV1IllustRankingRequest {
  /**
   * ランキングの種類
   */
  mode: RankingMode

  /**
   * OSフィルタ
   */
  filter: OSFilter

  /**
   * 対象日付 (YYYY-MM-DD。未指定の場合は本日の日付)
   */
  date?: string

  /**
   * オフセット
   */
  offset?: number
}

/**
 * GET /v1/illust/ranking のレスポンス
 */
export interface GetV1IllustRankingResponse {
  /**
   * イラストの詳細情報
   */
  illusts: PixivIllustItem[]

  /**
   * 次回のリクエストに使用する URL
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
   * 日付が YYYY-MM-DD 形式かどうかをチェックする
   *
   * @param date チェックする日付
   * @returns YYYY-MM-DD 形式なら true
   */
  checkDate(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    return regex.test(date)
  }
}
