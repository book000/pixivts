import { PixivNovelItem } from '../../pixiv-novel'

/**
 * GET /v1/search/novel のレスポンス
 */
export interface SearchNovelApiResponse {
  novels: PixivNovelItem[]
}
