import { PixivNovelSeriesItem } from '../../../pixiv-novel-series'

/**
 * GET /v1/novel/text のレスポンス
 */
export interface GetV1NovelTextResponse {
  /**
   * 不明
   *
   * @beta
   */
  novel_marker: Record<string, never>

  /**
   * 小説の本文
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
