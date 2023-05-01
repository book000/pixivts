import { PixivNovelItem } from '../../../pixiv-novel'

/**
 * GET /v2/novel/detail のリクエスト
 */
export interface GetV2NovelDetailRequest {
  /**
   * 小説ID
   */
  novel_id: number
}

/**
 * GET /v2/novel/detail のレスポンス
 */
export interface GetV2NovelDetailResponse {
  /**
   * 小説の詳細情報
   */
  novel: PixivNovelItem
}
