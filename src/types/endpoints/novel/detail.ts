import { PixivNovelItem } from '../../pixiv-novel'

/**
 * GET /v2/novel/detail のレスポンス
 */
export interface GetV2NovelDetailResponse {
  novel: PixivNovelItem
}
