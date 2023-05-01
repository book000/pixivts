import { PixivNovelItem } from 'src/types/pixiv-novel'
import { NovelSeriesDetail } from '../../../pixiv-novel-series'

/**
 * GET /v2/novel/series のリクエスト
 */
export interface GetV2NovelSeriesRequest {
  /**
   * 小説シリーズID
   */
  series_id: number

  /**
   * ?
   *
   * @default undefined
   * @beta
   */
  last_order?: string
}

/**
 * GET /v2/novel/series のレスポンス
 */
export interface GetV2NovelSeriesResponse {
  /**
   * シリーズ詳細
   */
  novel_series_detail: NovelSeriesDetail

  /**
   * シリーズの1個目の小説データ
   */
  novel_series_first_novel: PixivNovelItem

  /**
   * シリーズの最新の小説データ
   */
  novel_series_latest_novel: PixivNovelItem

  /**
   * シリーズにある小説一覧
   */
  novels: PixivNovelItem[]

  /**
   * 次 URL
   */
  next_url: string | null
}
