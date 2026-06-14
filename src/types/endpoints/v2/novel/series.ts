import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'
import {
  NovelSeriesDetail,
  NovelSeriesDetailCheck,
} from '../../../pixiv-novel-series'

/**
 * Request for GET /v2/novel/series
 */
export interface GetV2NovelSeriesRequest {
  /**
   * Novel series ID
   */
  series_id: number

  /**
   * Novel offset? It seems 30 items can be retrieved per request
   *
   * @default undefined
   * @beta
   */
  last_order?: number
}

/**
 * Response for GET /v2/novel/series
 */
export interface GetV2NovelSeriesResponse {
  /**
   * Series details
   */
  novel_series_detail: NovelSeriesDetail

  /**
   * First novel data in the series
   */
  novel_series_first_novel: PixivNovelItem

  /**
   * Latest novel data in the series
   */
  novel_series_latest_novel: PixivNovelItem

  /**
   * List of novels in the series
   */
  novels: PixivNovelItem[]

  /**
   * Next URL
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
