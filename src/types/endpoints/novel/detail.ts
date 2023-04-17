import { PixivNovelItem } from '../../pixivNovel'

/**
 * GET /v2/novel/detail のレスポンス
 */
export interface GetNovelDetailApiResponse {
  novel: PixivNovelItem
}
