import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'
import {
  NovelSeriesDetail,
  NovelSeriesDetailCheck,
} from '../../../pixiv-novel-series'

/**
 * GET /v2/novel/series のリクエスト
 */
export interface GetV2NovelSeriesRequest {
  /**
   * 小説シリーズID
   */
  series_id: number

  /**
   * 小説のオフセット？1リクエストにつき30個ずつ取得できるっぽい
   *
   * @default undefined
   * @beta
   */
  last_order?: number
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

export class GetV2NovelSeriesCheck extends BaseMultipleCheck<
  GetV2NovelSeriesRequest,
  GetV2NovelSeriesResponse
> {
  requestChecks(): CheckFunctions<GetV2NovelSeriesRequest> {
    return {
      series_id: (data) => typeof data.series_id === 'number',
      last_order: (data) => typeof data.last_order === 'number',
    }
  }

  responseChecks(): CheckFunctions<GetV2NovelSeriesResponse> {
    return {
      novel_series_detail: (data) =>
        typeof data.novel_series_detail === 'object' &&
        new NovelSeriesDetailCheck().throwIfFailed(data.novel_series_detail),
      novel_series_first_novel: (data) =>
        typeof data.novel_series_first_novel === 'object' &&
        new PixivNovelItemCheck().throwIfFailed(data.novel_series_first_novel),
      novel_series_latest_novel: (data) =>
        typeof data.novel_series_latest_novel === 'object' &&
        new PixivNovelItemCheck().throwIfFailed(data.novel_series_latest_novel),
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
}
