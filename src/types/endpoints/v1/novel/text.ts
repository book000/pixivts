import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import {
  PixivNovelSeriesItem,
  PixivNovelSeriesItemCheck,
} from '../../../pixiv-novel-series'
import { isEmptyObject } from '../../../../utils'

/**
 * GET /v1/novel/text のリクエスト
 */
export interface GetV1NovelTextRequest {
  /**
   * 小説ID
   */
  novel_id: number
}

/**
 * GET /v1/novel/text のレスポンス
 */
export interface GetV1NovelTextResponse {
  /**
   * 小説のマーカー情報。無い場合は空オブジェクト
   *
   * @beta
   */
  novel_marker:
    | {
        /**
         * マーカーが付いているページ番号
         */
        page: number
      }
    | Record<string, never>

  /**
   * 小説の本文
   *
   * [newpage] で改ページされる。
   */
  novel_text: string

  /**
   * この作品が属するシリーズでの前の作品。無い場合は空オブジェクト
   */
  series_prev: PixivNovelSeriesItem | Record<string, never>

  /**
   * この作品が属するシリーズでの次の作品。無い場合は空オブジェクト
   */
  series_next: PixivNovelSeriesItem | Record<string, never>
}

export class GetV1NovelTextCheck extends BaseMultipleCheck<
  GetV1NovelTextRequest,
  GetV1NovelTextResponse
> {
  requestChecks(): CheckFunctions<GetV1NovelTextRequest> {
    return {
      novel_id: (data) =>
        typeof data.novel_id === 'number' && data.novel_id > 0,
    }
  }

  responseChecks(): CheckFunctions<GetV1NovelTextResponse> {
    return {
      novel_marker: (data) =>
        typeof data.novel_marker === 'object' &&
        (isEmptyObject(data.novel_marker) ||
          typeof data.novel_marker.page === 'number'),
      novel_text: (data) => typeof data.novel_text === 'string',
      series_prev: (data) =>
        typeof data.series_prev === 'object' &&
        (isEmptyObject(data.series_prev) ||
          new PixivNovelSeriesItemCheck().throwIfFailed(data.series_prev)),
      series_next: (data) =>
        typeof data.series_next === 'object' &&
        (isEmptyObject(data.series_next) ||
          new PixivNovelSeriesItemCheck().throwIfFailed(data.series_next)),
    }
  }
}
