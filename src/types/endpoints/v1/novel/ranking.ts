import { RankingMode, RankingModeCheck } from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * GET /v1/novel/ranking のリクエスト
 */
export interface GetV1NovelRankingRequest {
  /**
   * ランキングの種類
   */
  mode: RankingMode

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
 * GET /v1/novel/ranking のレスポンス
 */
export interface GetV1NovelRankingResponse {
  /**
   * イラストの詳細情報
   */
  novels: PixivNovelItem[]

  /**
   * 次回のリクエストに使用する URL
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
