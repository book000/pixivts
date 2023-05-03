import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'
import {
  IllustSeriesDetail,
  IllustSeriesDetailCheck,
} from '../../../pixiv-illust-series'
import { Filter, FilterCheck } from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * GET /v1/illust/series のリクエスト
 */
export interface GetV1IllustSeriesRequest {
  /**
   * イラストシリーズID
   */
  illust_series_id: number

  /**
   * OSフィルタ
   *
   * @default 'for_ios'
   */
  filter: Filter

  // offset: number があるかもしれない。要確認
}

/**
 * GET /v1/illust/series のレスポンス
 */
export interface GetV1IllustSeriesResponse {
  /**
   * シリーズ詳細
   */
  illust_series_detail: IllustSeriesDetail

  /**
   * シリーズの最初のイラスト
   */
  illust_series_first_illust: PixivIllustItem

  /**
   * シリーズに含まれているイラスト群
   */
  illusts: PixivIllustItem[]

  /**
   * 次 URL
   */
  next_url: string | null
}

export class GetV1IllustSeriesCheck extends BaseMultipleCheck<
  GetV1IllustSeriesRequest,
  GetV1IllustSeriesResponse
> {
  requestChecks(): CheckFunctions<GetV1IllustSeriesRequest> {
    return {
      illust_series_id: (data) =>
        typeof data.illust_series_id === 'number' && data.illust_series_id > 0,
      filter: (data) => new FilterCheck().throwIfFailed(data.filter),
    }
  }

  responseChecks(): CheckFunctions<GetV1IllustSeriesResponse> {
    return {
      illust_series_detail: (data) =>
        typeof data.illust_series_detail === 'object' &&
        new IllustSeriesDetailCheck().throwIfFailed(data.illust_series_detail),
      illust_series_first_illust: (data) =>
        typeof data.illust_series_first_illust === 'object' &&
        new PixivIllustItemCheck().throwIfFailed(
          data.illust_series_first_illust
        ),
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.length > 0 &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      next_url: (data) =>
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
