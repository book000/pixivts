import { PixivNovelItem } from '../../pixiv-novel'

/**
 * GET /v1/search/novel のレスポンス
 */
export interface GetV1SearchNovelResponse {
  novels: PixivNovelItem[]
}
