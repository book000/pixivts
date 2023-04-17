import { PixivNovelItem } from '../../pixiv-novel'

/**
 * GET /v2/novel/detail のレスポンス
 */
export interface GetNovelDetailApiResponse {
  novel: PixivNovelItem
}
