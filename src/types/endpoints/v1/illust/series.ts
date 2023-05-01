import { PixivIllustItem } from '../../../pixiv-illust'
import { IllustSeriesDetail } from '../../../pixiv-illust-series'
import { Filter } from '../../../../options'

/**
 * GET /v1/illust/series のリクエスト
 */
export interface GetV1IllustSeriesRequest {
  /**
   * イラストシリーズID
   */
  illust_series_id: string

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
